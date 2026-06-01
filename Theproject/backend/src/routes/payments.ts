import express from 'express';
import prisma from '../config/database.js';
import { stripe } from '../config/stripe.js';
import { authMiddleware } from '../middleware/auth.js';
import { config } from '../config/index.js';
import { sendError, sendSuccess } from '../utils/response.js';

const router = express.Router();

router.post('/checkout-session', authMiddleware, async (req: any, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.body.orderId },
    include: { orderItems: { include: { product: true } } },
  });
  if (!order || order.buyerId !== req.user.userId) return sendError(res, 404, 'Order not found');
  if (!stripe) {
    return sendSuccess(res, 200, 'Stripe not configured; returning test payment result', {
      mode: 'test',
      orderId: order.id,
      paymentStatus: order.paymentStatus,
    });
  }
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    client_reference_id: order.id,
    customer_email: req.user.email,
    line_items: order.orderItems.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: 'php',
        unit_amount: Math.round(Number(item.price) * 100),
        product_data: { name: item.product.name, images: item.product.images.slice(0, 1) },
      },
    })),
    success_url: `${config.clientUrl}/profile?payment=success&order=${order.id}`,
    cancel_url: `${config.clientUrl}/checkout?payment=cancelled&order=${order.id}`,
  });
  sendSuccess(res, 200, 'Checkout session created successfully', { url: session.url, id: session.id });
});

router.post('/mark-paid/:orderId', authMiddleware, async (req: any, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.orderId } });
  if (!order || (req.user.role !== 'ADMIN' && order.buyerId !== req.user.userId)) return sendError(res, 404, 'Order not found');
  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { paymentStatus: 'COMPLETED', status: 'CONFIRMED' },
  });
  sendSuccess(res, 200, 'Payment marked complete', updated);
});

export default router;
