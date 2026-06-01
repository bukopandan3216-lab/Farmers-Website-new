import express from 'express';
import prisma from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { sendError, sendSuccess } from '../utils/response.js';

const router = express.Router();

router.get('/', authMiddleware, async (req: any, res) => {
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: req.user.userId },
        { receiverId: req.user.userId },
      ],
    },
    include: {
      sender: { select: { id: true, fullName: true, avatar: true, role: true } },
      receiver: { select: { id: true, fullName: true, avatar: true, role: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  sendSuccess(res, 200, 'Messages fetched successfully', messages);
});

router.get('/conversations', authMiddleware, async (req: any, res) => {
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: req.user.userId },
        { receiverId: req.user.userId },
      ],
    },
    include: {
      sender: { select: { id: true, fullName: true, avatar: true, role: true } },
      receiver: { select: { id: true, fullName: true, avatar: true, role: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const conversationMap: Record<string, any> = {};

  messages.forEach((message) => {
    const isOwn = message.senderId === req.user.userId;
    const otherUser = isOwn ? message.receiver : message.sender;
    const conversationId = otherUser.id;

    if (!conversationMap[conversationId]) {
      conversationMap[conversationId] = {
        otherUserId: otherUser.id,
        participantName: otherUser.fullName,
        participantPhoto: otherUser.avatar,
        participantRole: otherUser.role?.toLowerCase?.() || 'buyer',
        lastMessage: message.content,
        lastMessageTime: message.createdAt,
        unreadCount: 0,
        messages: [],
      };
    }

    conversationMap[conversationId].messages.push(message);
    conversationMap[conversationId].lastMessage = message.content;
    conversationMap[conversationId].lastMessageTime = message.createdAt;

    if (!isOwn && !message.read) {
      conversationMap[conversationId].unreadCount += 1;
    }
  });

  const conversations = Object.values(conversationMap).map((conversation: any) => ({
    ...conversation,
    messages: conversation.messages.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
  }));

  sendSuccess(res, 200, 'Conversations fetched successfully', conversations);
});

router.get('/conversation/:otherUserId', authMiddleware, async (req: any, res) => {
  const otherUserId = req.params.otherUserId;

  const otherUser = await prisma.user.findUnique({
    where: { id: otherUserId },
    select: { id: true, fullName: true, avatar: true, role: true },
  });

  const unreadFilter = {
    senderId: otherUserId,
    receiverId: req.user.userId,
    read: false,
  };

  await prisma.message.updateMany({
    where: unreadFilter,
    data: { read: true },
  });

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: req.user.userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: req.user.userId },
      ],
    },
    include: {
      sender: { select: { id: true, fullName: true, avatar: true, role: true } },
      receiver: { select: { id: true, fullName: true, avatar: true, role: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  sendSuccess(res, 200, 'Conversation fetched successfully', {
    otherUser,
    messages,
  });
});

router.post('/', authMiddleware, async (req: any, res) => {
  const { receiverId, content } = req.body;

  if (!receiverId || !content || !content.trim()) {
    return sendError(res, 400, 'Receiver and message content are required');
  }

  const message = await prisma.message.create({
    data: {
      senderId: req.user.userId,
      receiverId,
      content: content.trim(),
    },
    include: {
      sender: { select: { id: true, fullName: true, avatar: true, role: true } },
      receiver: { select: { id: true, fullName: true, avatar: true, role: true } },
    },
  });

  sendSuccess(res, 201, 'Message sent successfully', message);
});

export default router;
