import express from 'express';
import prisma from '../config/database.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { sendError, sendSuccess } from '../utils/response.js';

const router = express.Router();

router.post('/', authMiddleware, async (req: any, res) => {
  const { items, deliveryAddress } = req.body;
  if (!Array.isArray(items) || items.length === 0) return sendError(res, 400, 'Order items are required');
  const products = await prisma.product.findMany({
    where: { id: { in: items.map((item: any) => item.productId) } },
  });
  const total = items.reduce((sum: number, item: any) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    if (!product) throw new Error(`Product ${item.productId} not found`);
    if (product.stock < item.quantity) throw new Error(`${product.name} has insufficient stock`);
    return sum + product.price * item.quantity;
  }, 0);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        buyerId: req.user.userId,
        total,
        deliveryAddress,
        orderItems: {
          create: items.map((item: any) => {
            const product = products.find((candidate) => candidate.id === item.productId)!;
            return { productId: item.productId, quantity: item.quantity, price: product.price };
          }),
        },
      },
      include: { orderItems: { include: { product: true } } },
    });
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }
    await tx.cartItem.deleteMany({ where: { userId: req.user.userId } });
    return created;
  });

  sendSuccess(res, 201, 'Order created successfully', order);
});

router.get('/', authMiddleware, async (req: any, res) => {
  const where =
    req.user.role === 'ADMIN'
      ? {}
      : req.user.role === 'FARMER'
        ? { orderItems: { some: { product: { farmerId: req.user.userId } } } }
        : { buyerId: req.user.userId };
  const orders = await prisma.order.findMany({
    where,
    include: {
      buyer: { select: { id: true, fullName: true, email: true } },
      orderItems: { include: { product: { include: { farmer: { select: { id: true, fullName: true } } } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
  sendSuccess(res, 200, 'Orders fetched successfully', orders);
});

router.get('/:id', authMiddleware, async (req: any, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { buyer: true, orderItems: { include: { product: true } } },
  });
  if (!order) return sendError(res, 404, 'Order not found');
  const isFarmerOrder = order.orderItems.some((item) => item.product.farmerId === req.user.userId);
  if (req.user.role !== 'ADMIN' && order.buyerId !== req.user.userId && !isFarmerOrder) {
    return sendError(res, 403, 'Forbidden');
  }
  sendSuccess(res, 200, 'Order fetched successfully', order);
});

router.put('/:id/status', authMiddleware, roleMiddleware(['FARMER', 'ADMIN']), async (req, res) => {
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status: req.body.status, paymentStatus: req.body.paymentStatus },
  });
  sendSuccess(res, 200, 'Order updated successfully', order);
});

export default router;
