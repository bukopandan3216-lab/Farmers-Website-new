import express from 'express';
import prisma from '../config/database.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { hashPassword, comparePasswords } from '../utils/password.js';
import { sendError, sendSuccess } from '../utils/response.js';

import bcrypt from 'bcryptjs';

const router = express.Router();

// Get all users (admin only)
router.get('/', authMiddleware, roleMiddleware(['ADMIN']), async (_req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      avatar: true,
      phone: true,
      address: true,
      createdAt: true,
      accountSetupCompleted: true,
      farmerProfile: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  sendSuccess(res, 200, 'Users fetched successfully', users);
});

// Get current user profile
router.get('/me', authMiddleware, async (req: any, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      avatar: true,
      phone: true,
      address: true,
      totalSpent: true,
      memberSince: true,
      createdAt: true,
      farmerProfile: true,
    },
  });
  sendSuccess(res, 200, 'User profile fetched successfully', user);
});

// Get buyer dashboard analytics
router.get('/me/analytics', authMiddleware, async (req: any, res) => {
  if (req.user.role !== 'BUYER') {
    return sendError(res, 403, 'Only buyers can access this endpoint');
  }

  const [orders, favorites, reviews] = await Promise.all([
    prisma.order.findMany({
      where: { buyerId: req.user.userId },
      select: { total: true, createdAt: true },
    }),
    prisma.favorite.count({
      where: { userId: req.user.userId },
    }),
    prisma.review.count({
      where: { userId: req.user.userId },
    }),
  ]);

  const totalSpent = orders.reduce((sum, order) => sum + Number(order.total), 0);
  const totalOrders = orders.length;
  const memberDays = Math.floor(
    (new Date().getTime() - new Date(req.user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Get favorite category
  const favoriteCategory = await prisma.favorite.groupBy({
    by: ['productId'],
    where: { userId: req.user.userId },
    _count: true,
    orderBy: { _count: { productId: 'desc' } },
    take: 1,
  });

  let favoriteCategoryName = 'N/A';
  if (favoriteCategory.length > 0) {
    const product = await prisma.product.findUnique({
      where: { id: favoriteCategory[0].productId },
      select: { category: { select: { name: true } } },
    });
    favoriteCategoryName = product?.category?.name || 'N/A';
  }

  sendSuccess(res, 200, 'Buyer analytics fetched successfully', {
    totalOrders,
    totalSpent: Math.round(totalSpent * 100) / 100,
    totalFavorites: favorites,
    totalReviews: reviews,
    favoriteCategory: favoriteCategoryName,
    memberFor: memberDays,
  });
});

// Get farmer dashboard analytics
router.get('/me/farmer-analytics', authMiddleware, async (req: any, res) => {
  if (req.user.role !== 'FARMER') {
    return sendError(res, 403, 'Only farmers can access this endpoint');
  }

  const profile = await prisma.farmerProfile.findUnique({
    where: { userId: req.user.userId },
  });

  if (!profile) {
    return sendError(res, 404, 'Farmer profile not found');
  }

  const [products, orders, reviews, storeReviews, followers] = await Promise.all([
    prisma.product.count({
      where: { farmerId: req.user.userId },
    }),
    prisma.order.findMany({
      where: { orderItems: { some: { product: { farmerId: req.user.userId } } } },
      select: { total: true },
    }),
    prisma.review.findMany({
      where: { product: { farmerId: req.user.userId } },
      select: { rating: true },
    }),
    prisma.storeReview.findMany({
      where: { farmerId: profile.id },
      select: { rating: true },
    }),
    prisma.storeFollower.count({
      where: { farmerId: profile.id },
    }),
  ]);

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
  const avgProductRating = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
  const avgStoreRating = storeReviews.length ? storeReviews.reduce((sum, r) => sum + r.rating, 0) / storeReviews.length : 0;

  sendSuccess(res, 200, 'Farmer analytics fetched successfully', {
    totalProducts: products,
    totalOrders: orders.length,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    avgProductRating: Math.round(avgProductRating * 10) / 10,
    avgStoreRating: Math.round(avgStoreRating * 10) / 10,
    totalReviews: reviews.length,
    totalStoreReviews: storeReviews.length,
    followers,
  });
});

// Update user profile
router.put('/me', authMiddleware, async (req: any, res) => {
//  const user = await prisma.user.update({
  //  where: { id: req.user.userId },
  //  data: {
   //   fullName: req.body.fullName,
  //    avatar: req.body.avatar,
   //   phone: req.body.phone,
   //   address: req.body.address,
 //   },
 //   select: { id: true, fullName: true, email: true, role: true, avatar: true, phone: true, address: true },
 // });
  //sendSuccess(res, 200, 'Profile updated successfully', user);

  // If user is a farmer, also update their profile
   const {
    currentPassword,
    newPassword,
  } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      id: req.user.userId,
    },
  });

  if (!user) {
    return sendError(res, 404, 'User not found');
  }

  const isValid = await bcrypt.compare(
    currentPassword,
   user.passwordHash
  );

  if (!isValid) {
    return sendError(res, 400, 'Current password is incorrect');
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    10
  );

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      passwordHash: hashedPassword,
    },
  });

  return sendSuccess(
    res,
    200,
    'Password changed successfully'
  );
});

// Change password
router.post('/me/change-password', authMiddleware, async (req: any, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return sendError(res, 400, 'All fields are required');
  }

  if (newPassword !== confirmPassword) {
    return sendError(res, 400, 'New passwords do not match');
  }

  if (newPassword.length < 6) {
    return sendError(res, 400, 'Password must be at least 6 characters');
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
  });

  if (!user) {
    return sendError(res, 404, 'User not found');
  }

  const isPasswordValid = await comparePasswords(currentPassword, user.passwordHash);
  if (!isPasswordValid) {
    return sendError(res, 401, 'Current password is incorrect');
  }

  const hashedPassword = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: req.user.userId },
    data: { passwordHash: hashedPassword },
  });

  sendSuccess(res, 200, 'Password changed successfully');
});

// Update user role (admin only)
router.put('/:id/role', authMiddleware, roleMiddleware(['ADMIN']), async (req, res) => {
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { role: req.body.role } });
  sendSuccess(res, 200, 'User role updated successfully', user);
});

// Verify farmer (admin only)
router.put('/farmers/:id/verify', authMiddleware, roleMiddleware(['ADMIN']), async (req, res) => {
  const profile = await prisma.farmerProfile.findFirst({
    where: { OR: [{ id: req.params.id }, { userId: req.params.id }] },
  });
  if (!profile) return sendError(res, 404, 'Farmer not found');
  const updated = await prisma.farmerProfile.update({
    where: { id: profile.id },
    data: { verified: Boolean(req.body.verified ?? true) },
  });
  sendSuccess(res, 200, 'Farmer verification updated successfully', updated);
});

export default router;
