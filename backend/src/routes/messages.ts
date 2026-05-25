import express from 'express';
import prisma from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { sendSuccess } from '../utils/response.js';

const router = express.Router();

router.get('/', authMiddleware, async (req: any, res) => {
  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: req.user.userId }, { receiverId: req.user.userId }] },
    include: {
      sender: { select: { id: true, fullName: true, avatar: true } },
      receiver: { select: { id: true, fullName: true, avatar: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
  sendSuccess(res, 200, 'Messages fetched successfully', messages);
});

router.post('/', authMiddleware, async (req: any, res) => {
  const message = await prisma.message.create({
    data: {
      senderId: req.user.userId,
      receiverId: req.body.receiverId,
      content: req.body.content,
    },
    include: {
      sender: { select: { id: true, fullName: true, avatar: true } },
      receiver: { select: { id: true, fullName: true, avatar: true } },
    },
  });
  sendSuccess(res, 201, 'Message sent successfully', message);
});

export default router;
