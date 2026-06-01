import express from 'express';
import prisma from '../config/database.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = express.Router();

// Get farmer dashboard analytics
router.get('/farmer/dashboard', authMiddleware, roleMiddleware(['FARMER']), async (req: any, res) => {
  try {
    const userId = req.user.userId;
    
    // Get farmer profile
    const farmerProfile = await prisma.farmerProfile.findFirst({
      where: { userId },
    });

    if (!farmerProfile) {
      return sendError(res, 404, 'Farmer profile not found');
    }

    // Get total products (non-archived)
    const totalProducts = await prisma.product.count({
      where: { farmerId: userId, archived: false },
    });

    // Get total orders (sum of order items for this farmer's products)
    const totalOrders = await prisma.orderItem.count({
      where: { product: { farmerId: userId } },
    });

    // Get total revenue
    const revenueData = await prisma.orderItem.aggregate({
      where: { product: { farmerId: userId } },
      _sum: { price: true },
    });
    const totalRevenue = revenueData._sum.price || 0;

    // Get average rating from all product reviews
    const reviews = await prisma.review.findMany({
      where: { product: { farmerId: userId } },
      select: { rating: true },
    });
    const avgRating = reviews.length
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
      : 0;

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      where: {
        orderItems: { some: { product: { farmerId: userId } } },
      },
      include: {
        buyer: { select: { id: true, fullName: true, avatar: true } },
        orderItems: {
          where: { product: { farmerId: userId } },
          include: { product: { select: { name: true } } },
        },
        trackingHistory: { orderBy: { updatedAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Get top products by sales
    const topProducts = await prisma.product.findMany({
      where: { farmerId: userId },
      include: {
        orderItems: true,
        reviews: { select: { rating: true } },
      },
      orderBy: { orderItems: { _count: 'desc' } },
      take: 5,
    });

    const topProductsFormatted = topProducts.map(p => ({
      ...p,
      salesCount: p.orderItems.length,
      avgRating: p.reviews.length
        ? Math.round((p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length) * 10) / 10
        : 0,
    }));

    sendSuccess(res, 200, 'Farmer dashboard analytics fetched', {
      stats: {
        totalProducts,
        totalOrders,
        totalRevenue,
        avgRating,
      },
      recentOrders,
      topProducts: topProductsFormatted,
    });
  } catch (error: any) {
    console.error(error);
    sendError(res, 500, 'Failed to fetch dashboard analytics');
  }
});

// Get buyer dashboard analytics
router.get('/buyer/dashboard', authMiddleware, roleMiddleware(['BUYER']), async (req: any, res) => {
  try {
    const userId = req.user.userId;

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Get total orders
    const totalOrders = await prisma.order.count({
      where: { buyerId: userId },
    });

    // Get total spent
    const spentData = await prisma.order.aggregate({
      where: { buyerId: userId, paymentStatus: 'COMPLETED' },
      _sum: { total: true },
    });
    const totalSpent = spentData._sum.total || 0;

    // Get favorite category
    const favoriteCategory = await prisma.favorite.groupBy({
      by: ['productId'],
      where: { userId },
      _count: true,
      orderBy: { _count: { productId: 'desc' } },
      take: 1,
    });

    let favoriteCategoryName = 'N/A';
    if (favoriteCategory.length > 0) {
      const product = await prisma.product.findUnique({
        where: { id: favoriteCategory[0].productId },
        include: { category: true },
      });
      favoriteCategoryName = product?.category.name || 'N/A';
    }

    // Calculate member days (use createdAt since memberSince may not be set)
    const memberDays = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      where: { buyerId: userId },
      include: {
        orderItems: { include: { product: { select: { name: true } } } },
        trackingHistory: { orderBy: { updatedAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Get pending orders (not delivered)
    const pendingOrders = await prisma.order.findMany({
      where: { buyerId: userId, status: { not: 'DELIVERED' } },
      include: {
        orderItems: { include: { product: true } },
        trackingHistory: { orderBy: { updatedAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, 200, 'Buyer dashboard analytics fetched', {
      stats: {
        totalOrders,
        totalSpent,
        favoriteCategory: favoriteCategoryName,
        memberDays,
      },
      recentOrders,
      pendingOrders,
    });
  } catch (error: any) {
    console.error(error);
    sendError(res, 500, 'Failed to fetch dashboard analytics');
  }
});

export default router;
