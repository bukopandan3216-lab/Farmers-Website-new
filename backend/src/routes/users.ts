import express from 'express';
import prisma from '../config/database.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { hashPassword } from '../utils/password.js';
import { sendError, sendSuccess } from '../utils/response.js';

const router = express.Router();

router.get('/', authMiddleware, roleMiddleware(['ADMIN']), async (_req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      avatar: true,
      phone: true,
      address: true,
      createdAt: true,
      farmerProfile: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  sendSuccess(res, 200, 'Users fetched successfully', users);
});

router.put('/me', authMiddleware, async (req: any, res) => {
  const user = await prisma.user.update({
    where: { id: req.user.userId },
    data: {
      fullName: req.body.fullName,
      avatar: req.body.avatar,
      phone: req.body.phone,
      address: req.body.address,
      ...(req.body.password ? { passwordHash: await hashPassword(req.body.password) } : {}),
    },
    select: { id: true, fullName: true, email: true, role: true, avatar: true, phone: true, address: true },
  });
  sendSuccess(res, 200, 'Profile updated successfully', user);
});

router.put('/:id/role', authMiddleware, roleMiddleware(['ADMIN']), async (req, res) => {
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { role: req.body.role } });
  sendSuccess(res, 200, 'User role updated successfully', user);
});

router.put('/farmers/:id/verify', authMiddleware, roleMiddleware(['ADMIN']), async (req, res) => {
  const profile = await prisma.farmerProfile.findFirst({
    where: { OR: [{ id: req.params.id }, { userId: req.params.id }] },
  });
  if (!profile) return sendError(res, 404, 'Farmer not found');
  const updated = await prisma.farmerProfile.update({
    where: { id: profile.id },
    data: { verified: Boolean(req.body.verified ?? true) },
  });
  sendSuccess(res, 200, 'Farmer verification updated successfully', updated);
});

export default router;
