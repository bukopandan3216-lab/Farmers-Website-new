import express from 'express';
import prisma from '../config/database.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { sendError, sendSuccess } from '../utils/response.js';

const router = express.Router();

// Get all farmers with counts
router.get('/', async (req, res) => {
  const farmers = await prisma.farmerProfile.findMany({
    include: {
      user: { select: { id: true, fullName: true, email: true, avatar: true, phone: true } },
    },
    orderBy: [{ verified: 'desc' }, { farmName: 'asc' }],
  });
  const withCounts = await Promise.all(
    farmers.map(async (farmer) => {
      const [productsCount, reviews] = await Promise.all([
        prisma.product.count({ where: { farmerId: farmer.userId } }),
        prisma.review.findMany({
          where: { product: { farmerId: farmer.userId } },
          select: { rating: true },
        }),
      ]);
      const avgRating = reviews.length
        ? Math.round((reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length) * 10) / 10
        : 0;
      return { ...farmer, productsCount, avgRating, reviewCount: reviews.length };
    }),
  );
  sendSuccess(res, 200, 'Farmers fetched successfully', withCounts);
});

// Get featured farmers
router.get('/featured/list', async (req, res) => {
  const featured = await prisma.farmerProfile.findMany({
    where: { featured: true },
    include: {
      user: { select: { id: true, fullName: true, email: true, avatar: true, phone: true } },
    },
    orderBy: [{ avgRating: 'desc' }, { followerCount: 'desc' }],
    take: 6,
  });

  const withCounts = await Promise.all(
    featured.map(async (farmer) => {
      const productsCount = await prisma.product.count({ where: { farmerId: farmer.userId } });
      return { ...farmer, productsCount };
    }),
  );

  sendSuccess(res, 200, 'Featured farmers fetched successfully', withCounts);
});

// Mark or unmark a farmer as featured
router.patch('/:id/featured', authMiddleware, roleMiddleware(['ADMIN']), async (req, res) => {
  const profile = await prisma.farmerProfile.findFirst({
    where: { OR: [{ id: req.params.id }, { userId: req.params.id }] },
  });

  if (!profile) return sendError(res, 404, 'Farmer not found');

  const updated = await prisma.farmerProfile.update({
    where: { id: profile.id },
    data: {
      featured: req.body.featured === false ? false : true,
    },
  });

  sendSuccess(res, 200, 'Farmer featured status updated successfully', updated);
});

// Get farmer by ID
router.get('/:id', async (req, res) => {
  const profile = await prisma.farmerProfile.findFirst({
    where: { OR: [{ id: req.params.id }, { userId: req.params.id }] },
    include: { user: { select: { id: true, fullName: true, email: true, avatar: true, phone: true } } },
  });

  if (!profile) return sendError(res, 404, 'Farmer not found');

  const [products, storeReviews] = await Promise.all([
    prisma.product.findMany({
      where: { farmerId: profile.userId },
      include: { category: true, reviews: { select: { rating: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.storeReview.findMany({
      where: { farmerId: profile.id },
      include: { user: { select: { id: true, fullName: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const avgProductRating = products.reduce((acc, p) => acc + (p.reviews.length ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length : 0), 0) / (products.length || 1);
  const avgStoreRating = storeReviews.length ? storeReviews.reduce((sum, r) => sum + r.rating, 0) / storeReviews.length : 0;

  sendSuccess(res, 200, 'Farmer fetched successfully', {
    ...profile,
    products: products.map((product) => ({
      ...product,
      avgRating: product.reviews.length ? Math.round((product.reviews.reduce((sum, item) => sum + item.rating, 0) / product.reviews.length) * 10) / 10 : 0,
      reviewCount: product.reviews.length,
    })),
    storeReviews,
    avgProductRating: Math.round(avgProductRating * 10) / 10,
    avgStoreRating: Math.round(avgStoreRating * 10) / 10,
  });
});

// Get farmer store reviews
router.get('/:id/reviews', async (req, res) => {
  const profile = await prisma.farmerProfile.findFirst({
    where: { OR: [{ id: req.params.id }, { userId: req.params.id }] },
  });

  if (!profile) return sendError(res, 404, 'Farmer not found');

  const reviews = await prisma.storeReview.findMany({
    where: { farmerId: profile.id },
    include: { user: { select: { id: true, fullName: true, avatar: true } } },
    orderBy: { createdAt: 'desc' },
  });

  sendSuccess(res, 200, 'Store reviews fetched successfully', reviews);
});

// Follow a farmer
router.post('/:id/follow', authMiddleware, async (req: any, res) => {
  const profile = await prisma.farmerProfile.findFirst({
    where: { OR: [{ id: req.params.id }, { userId: req.params.id }] },
  });

  if (!profile) return sendError(res, 404, 'Farmer not found');
  if (profile.userId === req.user.userId) return sendError(res, 400, 'Cannot follow your own store');

  const existingFollow = await prisma.storeFollower.findUnique({
    where: {
      userId_farmerId: {
        userId: req.user.userId,
        farmerId: profile.id,
      },
    },
  });

  if (existingFollow) return sendError(res, 400, 'Already following this farmer');

  await prisma.storeFollower.create({
    data: {
      userId: req.user.userId,
      farmerId: profile.id,
    },
  });

  // Update follower count
  await prisma.farmerProfile.update({
    where: { id: profile.id },
    data: { followerCount: { increment: 1 } },
  });

  sendSuccess(res, 201, 'Farmer followed successfully');
});

// Unfollow a farmer
router.delete('/:id/follow', authMiddleware, async (req: any, res) => {
  const profile = await prisma.farmerProfile.findFirst({
    where: { OR: [{ id: req.params.id }, { userId: req.params.id }] },
  });

  if (!profile) return sendError(res, 404, 'Farmer not found');

  const follow = await prisma.storeFollower.findUnique({
    where: {
      userId_farmerId: {
        userId: req.user.userId,
        farmerId: profile.id,
      },
    },
  });

  if (!follow) return sendError(res, 404, 'Not following this farmer');

  await prisma.storeFollower.delete({
    where: {
      userId_farmerId: {
        userId: req.user.userId,
        farmerId: profile.id,
      },
    },
  });

  // Update follower count
  await prisma.farmerProfile.update({
    where: { id: profile.id },
    data: { followerCount: { decrement: 1 } },
  });

  sendSuccess(res, 200, 'Farmer unfollowed successfully');
});

// Update farmer profile
router.put('/me/profile', authMiddleware, roleMiddleware(['FARMER']), async (req: any, res) => {
  const {
    fullName,
    contact,
    address,
    city,
    province,
  } = req.body;

  const updatedUser = await prisma.user.update({
    where: {
      id: req.user.userId,
    },
    data: {
      fullName,
      contact,
      address,
      city,
      province,
    },
  });
  sendSuccess(res, 200, 'Farm profile saved successfully', updatedUser);
});

export default router;
