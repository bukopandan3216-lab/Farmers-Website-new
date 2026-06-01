import express from 'express';
import prisma from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { sendError, sendSuccess } from '../utils/response.js';

const router = express.Router();

// Get product reviews
router.get('/product/:id', async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { productId: req.params.id },
    include: { user: { select: { id: true, fullName: true, avatar: true } } },
    orderBy: { createdAt: 'desc' },
  });
  sendSuccess(res, 200, 'Product reviews fetched successfully', reviews);
});

// Get store reviews
router.get('/store/:id', async (req, res) => {
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

// Get user's reviews
router.get('/my-reviews', authMiddleware, async (req: any, res) => {
  const [productReviews, storeReviews] = await Promise.all([
    prisma.review.findMany({
      where: { userId: req.user.userId },
      include: {
        product: { select: { id: true, name: true, images: true } },
        user: { select: { id: true, fullName: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.storeReview.findMany({
      where: { userId: req.user.userId },
      include: {
        farmer: { select: { id: true, farmName: true, coverImage: true } },
        user: { select: { id: true, fullName: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  sendSuccess(res, 200, 'User reviews fetched successfully', {
    productReviews,
    storeReviews,
  });
});

// Create product review
router.post('/product', authMiddleware, async (req: any, res) => {
  const { productId, rating, comment } = req.body;
  if (!productId || !rating) return sendError(res, 400, 'Product and rating are required');

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return sendError(res, 404, 'Product not found');

  // Check if user already reviewed this product
  const existingReview = await prisma.review.findFirst({
    where: { productId, userId: req.user.userId },
  });
  if (existingReview) return sendError(res, 400, 'You already reviewed this product');

  const review = await prisma.$transaction(async (tx) => {
    const created = await tx.review.create({
      data: { productId, userId: req.user.userId, rating: Number(rating), comment },
      include: { user: { select: { id: true, fullName: true, avatar: true } } },
    });

    // Update product rating
    const allReviews = await tx.review.findMany({
      where: { productId },
      select: { rating: true },
    });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await tx.product.update({
      where: { id: productId },
      data: { avgRating },
    });

    return created;
  });

  sendSuccess(res, 201, 'Product review created successfully', review);
});

// Create store review
router.post('/store', authMiddleware, async (req: any, res) => {
  const { farmerId, rating, comment } = req.body;
  if (!farmerId || !rating) return sendError(res, 400, 'Farmer and rating are required');

  const farmer = await prisma.farmerProfile.findUnique({ where: { id: farmerId } });
  if (!farmer) return sendError(res, 404, 'Farmer not found');

  if (farmer.userId === req.user.userId) return sendError(res, 400, 'Cannot review your own store');

  // Check if user already reviewed this store
  const existingReview = await prisma.storeReview.findFirst({
    where: { farmerId, userId: req.user.userId },
  });
  if (existingReview) return sendError(res, 400, 'You already reviewed this store');

  const review = await prisma.storeReview.create({
    data: { farmerId, userId: req.user.userId, rating: Number(rating), comment },
    include: { user: { select: { id: true, fullName: true, avatar: true } } },
  });

  // Update store rating
  const allReviews = await prisma.storeReview.findMany({
    where: { farmerId },
    select: { rating: true },
  });
  const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

  await prisma.farmerProfile.update({
    where: { id: farmerId },
    data: { avgRating },
  });

  sendSuccess(res, 201, 'Store review created successfully', review);
});

// Delete product review
router.delete('/product/:id', authMiddleware, async (req: any, res) => {
  const review = await prisma.review.findUnique({ where: { id: req.params.id } });
  if (!review) return sendError(res, 404, 'Review not found');
  if (req.user.role !== 'ADMIN' && review.userId !== req.user.userId) return sendError(res, 403, 'Forbidden');

  const { productId } = review;
  
  await prisma.$transaction(async (tx) => {
    await tx.review.delete({ where: { id: req.params.id } });

    // Update product rating
    const allReviews = await tx.review.findMany({
      where: { productId },
      select: { rating: true },
    });
    const avgRating = allReviews.length ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length : 0;

    await tx.product.update({
      where: { id: productId },
      data: { avgRating },
    });
  });

  sendSuccess(res, 200, 'Review deleted successfully');
});

// Delete store review
router.delete('/store/:id', authMiddleware, async (req: any, res) => {
  const review = await prisma.storeReview.findUnique({ where: { id: req.params.id } });
  if (!review) return sendError(res, 404, 'Review not found');
  if (req.user.role !== 'ADMIN' && review.userId !== req.user.userId) return sendError(res, 403, 'Forbidden');

  const { farmerId } = review;
  
  await prisma.$transaction(async (tx) => {
    await tx.storeReview.delete({ where: { id: req.params.id } });

    // Update store rating
    const allReviews = await tx.storeReview.findMany({
      where: { farmerId },
      select: { rating: true },
    });
    const avgRating = allReviews.length ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length : 0;

    await tx.farmerProfile.update({
      where: { id: farmerId },
      data: { avgRating },
    });
  });

  sendSuccess(res, 200, 'Review deleted successfully');
});

export default router;
