import express from 'express';
import prisma from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { sendError, sendSuccess } from '../utils/response.js';

const router = express.Router();

router.get('/', authMiddleware, async (req: any, res) => {
  const cart = await prisma.cart.upsert({
    where: { userId: req.user.userId },
    create: { userId: req.user.userId },
    update: {},
    include: { items: { include: { product: { include: { farmer: true, category: true } } } } },
  });
  sendSuccess(res, 200, 'Cart fetched successfully', cart.items);
});

router.post('/', authMiddleware, async (req: any, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return sendError(res, 404, 'Product not found');
  const cart = await prisma.cart.upsert({
    where: { userId: req.user.userId },
    create: { userId: req.user.userId },
    update: {},
  });
  const item = await prisma.cartItem.upsert({
    where: { userId_productId: { userId: req.user.userId, productId } },
    create: { cartId: cart.id, userId: req.user.userId, productId, quantity },
    update: { quantity: { increment: quantity } },
    include: { product: true },
  });
  sendSuccess(res, 200, 'Cart updated successfully', item);
});

router.put('/:productId', authMiddleware, async (req: any, res) => {
  const quantity = Number(req.body.quantity);
  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({ where: { userId: req.user.userId, productId: req.params.productId } });
    return sendSuccess(res, 200, 'Cart item removed successfully');
  }
  const item = await prisma.cartItem.update({
    where: { userId_productId: { userId: req.user.userId, productId: req.params.productId } },
    data: { quantity },
    include: { product: true },
  });
  sendSuccess(res, 200, 'Cart item updated successfully', item);
});

router.delete('/:productId', authMiddleware, async (req: any, res) => {
  await prisma.cartItem.deleteMany({ where: { userId: req.user.userId, productId: req.params.productId } });
  sendSuccess(res, 200, 'Cart item removed successfully');
});

router.delete('/', authMiddleware, async (req: any, res) => {
  await prisma.cartItem.deleteMany({ where: { userId: req.user.userId } });
  sendSuccess(res, 200, 'Cart cleared successfully');
});

export default router;
