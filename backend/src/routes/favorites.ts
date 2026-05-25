import express from 'express';
import prisma from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { sendSuccess } from '../utils/response.js';

const router = express.Router();

router.get('/', authMiddleware, async (req: any, res) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId: req.user.userId },
    include: { product: { include: { category: true, farmer: true } } },
  });
  sendSuccess(res, 200, 'Favorites fetched successfully', favorites);
});

router.post('/:productId', authMiddleware, async (req: any, res) => {
  const favorite = await prisma.favorite.upsert({
    where: { userId_productId: { userId: req.user.userId, productId: req.params.productId } },
    create: { userId: req.user.userId, productId: req.params.productId },
    update: {},
  });
  sendSuccess(res, 200, 'Favorite saved successfully', favorite);
});

router.delete('/:productId', authMiddleware, async (req: any, res) => {
  await prisma.favorite.deleteMany({ where: { userId: req.user.userId, productId: req.params.productId } });
  sendSuccess(res, 200, 'Favorite removed successfully');
});

export default router;
