import express from 'express';
import prisma from '../config/database.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { sendError, sendSuccess } from '../utils/response.js';

import { OrderStatus } from '@prisma/client';

const router = express.Router();

// Create new order
router.post('/', authMiddleware, async (req: any, res) => {
  const { items, deliveryAddress } = req.body;
  if (!Array.isArray(items) || items.length === 0) return sendError(res, 400, 'Order items are required');
  
  const products = await prisma.product.findMany({
    where: { id: { in: items.map((item: any) => item.productId) } },
  });

  // Check stock availability
  const outOfStock = items.filter((item: any) => {
    const product = products.find((p) => p.id === item.productId);
    return !product || product.stock < item.quantity;
  });

  if (outOfStock.length > 0) {
    return sendError(res, 400, 'Some products are out of stock or have insufficient quantity');
  }

  const total = items.reduce((sum: number, item: any) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    return sum + Number(product!.price) * item.quantity;
  }, 0);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        buyerId: req.user.userId,
        total,
        deliveryAddress,
        status: 'PENDING',
        orderItems: {
          create: items.map((item: any) => {
            const product = products.find((candidate) => candidate.id === item.productId)!;
            return { productId: item.productId, quantity: item.quantity, price: product.price };
          }),
        },
        trackingHistory: {
          create: {
            status: 'PENDING',
            notes: 'Order placed successfully',
          },
        },
      },
      include: { orderItems: { include: { product: true } } },
    });

    // Decrement product stock
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Clear cart
    await tx.cartItem.deleteMany({ where: { userId: req.user.userId } });

    return created;
  });

  sendSuccess(res, 201, 'Order created successfully', order);
});

// Get all orders (buyer sees own, farmer sees related, admin sees all)
router.get('/', authMiddleware, async (req: any, res) => {
  const where =
    req.user.role === 'ADMIN'
      ? {}
      : req.user.role === 'FARMER'
        ? { orderItems: { some: { product: { farmerId: req.user.userId } } } }
        : { buyerId: req.user.userId, status: { notIn: [OrderStatus.DELIVERED, OrderStatus.CANCELLED] } }; // Exclude completed orders

  const orders = await prisma.order.findMany({
    where,
    include: {
      buyer: { select: { id: true, fullName: true, email: true, avatar: true } },
      orderItems: {
        include: {
          product: {
            include: {
              farmer: {
                select: { id: true, fullName: true, farmerProfile: { select: { farmName: true } } },
              },
            },
          },
        },
      },
      trackingHistory: { orderBy: { updatedAt: 'desc' } },
    },
    orderBy: { createdAt: 'desc' },
  });

  sendSuccess(res, 200, 'Orders fetched successfully', orders);
});

// Get received orders (buyer only - delivered)
router.get('/received', authMiddleware, async (req: any, res) => {
  if (req.user.role !== 'BUYER') {
    return sendError(res, 403, 'Only buyers can access received orders');
  }

  const orders = await prisma.order.findMany({
    where: {
      buyerId: req.user.userId,
      status: 'DELIVERED',
    },
    include: {
      buyer: { select: { id: true, fullName: true, email: true, avatar: true } },
      orderItems: {
        include: {
          product: {
            include: {
              farmer: {
                select: { id: true, fullName: true, farmerProfile: { select: { farmName: true } } },
              },
            },
          },
        },
      },
      trackingHistory: { orderBy: { updatedAt: 'desc' } },
    },
    orderBy: { createdAt: 'desc' },
  });

  sendSuccess(res, 200, 'Received orders fetched successfully', orders);
});

// Get order by ID
router.get('/:id', authMiddleware, async (req: any, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      buyer: { select: { id: true, fullName: true, email: true, avatar: true } },
      orderItems: {
        include: {
          product: {
            include: {
              farmer: {
                select: { id: true, fullName: true, farmerProfile: { select: { farmName: true } } },
              },
            },
          },
        },
      },
      trackingHistory: { orderBy: { updatedAt: 'desc' } },
    },
  });

  if (!order) return sendError(res, 404, 'Order not found');

  // Check authorization
  const isFarmerOrder = order.orderItems.some((item) => item.product.farmerId === req.user.userId);
  if (req.user.role !== 'ADMIN' && order.buyerId !== req.user.userId && !isFarmerOrder) {
    return sendError(res, 403, 'Forbidden');
  }

  sendSuccess(res, 200, 'Order fetched successfully', order);
});

// Get order tracking history
router.get('/:id/tracking', authMiddleware, async (req: any, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    select: { buyerId: true, orderItems: { select: { product: { select: { farmerId: true } } } } },
  });

  if (!order) return sendError(res, 404, 'Order not found');

  // Check authorization
  const isFarmerOrder = order.orderItems.some((item) => item.product.farmerId === req.user.userId);
  if (req.user.role !== 'ADMIN' && order.buyerId !== req.user.userId && !isFarmerOrder) {
    return sendError(res, 403, 'Forbidden');
  }

  const tracking = await prisma.orderTracking.findMany({
    where: { orderId: req.params.id },
    orderBy: { updatedAt: 'desc' },
  });

  sendSuccess(res, 200, 'Order tracking history fetched successfully', tracking);
});

// Update order status (farmer only)
router.put('/:id/status', authMiddleware, roleMiddleware(['FARMER', 'ADMIN']), async (req: any, res) => {
  const { status, notes, logisticsProvider } = req.body;
  if (!status) return sendError(res, 400, 'Status is required');

  const allowedStatuses = ['CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'SHIPPED'];
  if (!allowedStatuses.includes(status)) {
    return sendError(res, 400, 'Invalid status update');
  }

  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      orderItems: {
        select: {
          product: { select: { farmerId: true } },
        },
      },
    },
  });

  if (!order) return sendError(res, 404, 'Order not found');

  // Check if user is farmer of any product in this order
  const isFarmerOrder = order.orderItems.some((item) => item.product.farmerId === req.user.userId);
  if (req.user.role !== 'ADMIN' && !isFarmerOrder) {
    return sendError(res, 403, 'Forbidden');
  }

  const orderAny = order as any;
  const updateData: any = { status };
  if (status === 'OUT_FOR_DELIVERY') {
    updateData.logisticsProvider = logisticsProvider || orderAny.logisticsProvider || 'Assigned by farm';
    updateData.logisticsAssignedAt = new Date();
  }

  const updatedOrder = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: req.params.id },
      data: updateData,
      include: { orderItems: { include: { product: true } } },
    });

    // Add tracking history entry
    await tx.orderTracking.create({
      data: {
        orderId: req.params.id,
        status,
        updatedBy: req.user.userId,
        notes: notes || undefined,
      },
    });

    return updated;
  });

  sendSuccess(res, 200, 'Order status updated successfully', updatedOrder);
});

// Buyer confirms delivery - order moves to DELIVERED
router.post('/:id/delivered', authMiddleware, async (req: any, res) => {
  if (req.user.role !== 'BUYER') {
    return sendError(res, 403, 'Only buyers can confirm delivery');
  }

  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      orderItems: { include: { product: true } },
    },
  });

  if (!order) return sendError(res, 404, 'Order not found');
  if (order.buyerId !== req.user.userId) return sendError(res, 403, 'Forbidden');
  if (order.status !== 'OUT_FOR_DELIVERY') {
    return sendError(res, 400, 'Order must be out for delivery before it can be marked as delivered');
  }

  const commissionRate = Math.min(Math.max(parseFloat(process.env.PLATFORM_COMMISSION_RATE || '0.05'), 0.03), 0.05);
  const distinctFarmerIds = Array.from(new Set(order.orderItems.map((item) => item.product.farmerId)));
  const farmerId = distinctFarmerIds[0];

  const farmerProfile = await prisma.farmerProfile.findUnique({
    where: { userId: farmerId },
  });

  const farmerProfileAny = farmerProfile as any;
  const dueDate = new Date();
  switch (farmerProfileAny?.commissionFrequency || 'MONTHLY') {
    case 'DAILY':
      dueDate.setDate(dueDate.getDate() + 1);
      break;
    case 'WEEKLY':
      dueDate.setDate(dueDate.getDate() + 7);
      break;
    default:
      dueDate.setMonth(dueDate.getMonth() + 1);
      break;
  }

  const updatedOrder = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: req.params.id },
      data: { status: 'DELIVERED' },
      include: { orderItems: { include: { product: true } } },
    });

    await tx.orderTracking.create({
      data: {
        orderId: req.params.id,
        status: 'DELIVERED',
        updatedBy: req.user.userId,
        notes: 'Delivery confirmed by buyer',
      },
    });

    await (tx as any).adminCommission.create({
      data: {
        orderId: req.params.id,
        farmerId,
        totalOrderSum: updated.total,
        commissionRate,
        commissionFee: (updated.total as any).mul(commissionRate),
        paymentDeadline: farmerProfileAny?.commissionFrequency || 'MONTHLY',
        dueDate,
      },
    });

    return updated;
  });

  sendSuccess(res, 200, 'Order marked as delivered and commission recorded', updatedOrder);
});

// Cancel order (buyer or farmer before out for delivery)
router.post('/:id/cancel', authMiddleware, async (req: any, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      orderItems: {
        select: {
          productId: true,
          quantity: true,
          product: { select: { farmerId: true } },
        },
      },
    },
  });

  if (!order) return sendError(res, 404, 'Order not found');

  const isFarmerOrder = order.orderItems.some((item) => item.product.farmerId === req.user.userId);
  if (order.buyerId !== req.user.userId && req.user.role !== 'ADMIN' && !isFarmerOrder) {
    return sendError(res, 403, 'Forbidden');
  }

  if (['OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].includes(order.status)) {
    return sendError(res, 400, 'Order can no longer be cancelled once it is out for delivery');
  }

  const cancelled = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
      include: { orderItems: { include: { product: true } } },
    });

    // Restore product stock
    for (const item of order.orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    await tx.orderTracking.create({
      data: {
        orderId: req.params.id,
        status: 'CANCELLED',
        updatedBy: req.user.userId,
        notes: order.buyerId === req.user.userId ? 'Order cancelled by buyer' : 'Order cancelled by farmer',
      },
    });

    return updated;
  });

  sendSuccess(res, 200, 'Order cancelled successfully', cancelled);
});

export default router;
