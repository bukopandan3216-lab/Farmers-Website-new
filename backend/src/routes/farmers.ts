import express from 'express';
import prisma from '../config/database.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { sendError, sendSuccess } from '../utils/response.js';

const router = express.Router();

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
      return { ...farmer, productsCount, avgRating };
    }),
  );
  sendSuccess(res, 200, 'Farmers fetched successfully', withCounts);
});

router.get('/:id', async (req, res) => {
  const profile = await prisma.farmerProfile.findFirst({
    where: { OR: [{ id: req.params.id }, { userId: req.params.id }] },
    include: { user: { select: { id: true, fullName: true, email: true, avatar: true, phone: true } } },
  });

  if (!profile) return sendError(res, 404, 'Farmer not found');

  const products = await prisma.product.findMany({
    where: { farmerId: profile.userId },
    include: { category: true, reviews: { select: { rating: true } } },
    orderBy: { createdAt: 'desc' },
  });
  sendSuccess(res, 200, 'Farmer fetched successfully', {
    ...profile,
    products: products.map((product) => ({
      ...product,
      avgRating: product.reviews.length
        ? Math.round((product.reviews.reduce((sum, item) => sum + item.rating, 0) / product.reviews.length) * 10) / 10
        : 0,
      reviewCount: product.reviews.length,
    })),
  });
});

router.put('/me/profile', authMiddleware, roleMiddleware(['FARMER']), async (req: any, res) => {
  const profile = await prisma.farmerProfile.upsert({
    where: { userId: req.user.userId },
    create: {
      userId: req.user.userId,
      farmName: req.body.farmName,
      farmDescription: req.body.farmDescription,
      farmLocation: req.body.farmLocation,
      coverImage: req.body.coverImage,
    },
    update: {
      farmName: req.body.farmName,
      farmDescription: req.body.farmDescription,
      farmLocation: req.body.farmLocation,
      coverImage: req.body.coverImage,
    },
  });
  sendSuccess(res, 200, 'Farm profile saved successfully', profile);
});

export default router;
