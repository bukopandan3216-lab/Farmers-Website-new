import express from 'express';
import prisma from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { sendError, sendSuccess } from '../utils/response.js';

const router = express.Router();

router.get('/product/:id', async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { productId: req.params.id },
    include: { user: { select: { id: true, fullName: true, avatar: true } } },
    orderBy: { createdAt: 'desc' },
  });
  sendSuccess(res, 200, 'Reviews fetched successfully', reviews);
});

router.post('/', authMiddleware, async (req: any, res) => {
  const { productId, rating, comment } = req.body;
  if (!productId || !rating) return sendError(res, 400, 'Product and rating are required');
  const review = await prisma.review.create({
    data: { productId, userId: req.user.userId, rating: Number(rating), comment },
    include: { user: { select: { id: true, fullName: true, avatar: true } } },
  });
  sendSuccess(res, 201, 'Review created successfully', review);
});

router.delete('/:id', authMiddleware, async (req: any, res) => {
  const review = await prisma.review.findUnique({ where: { id: req.params.id } });
  if (!review) return sendError(res, 404, 'Review not found');
  if (req.user.role !== 'ADMIN' && review.userId !== req.user.userId) return sendError(res, 403, 'Forbidden');
  await prisma.review.delete({ where: { id: req.params.id } });
  sendSuccess(res, 200, 'Review deleted successfully');
});

export default router;
