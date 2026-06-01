import express from 'express';
import prisma from '../config/database.js';
import { sendSuccess } from '../utils/response.js';

const router = express.Router();

// Multi-field search (products, farmers, buyers)
router.get('/', async (req, res) => {
  const { q, type = 'all' } = req.query;
  const query = String(q || '').trim().toLowerCase();

  if (!query || query.length < 2) {
    return sendSuccess(res, 200, 'Search results', {
      products: [],
      farmers: [],
      buyers: [],
    });
  }

  try {
    const [products, farmers, buyers] = await Promise.all([
      type === 'all' || type === 'product'
        ? prisma.product.findMany({
            where: {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
              ],
            },
            include: {
              farmer: {
                select: {
                  id: true,
                  fullName: true,
                  farmerProfile: { select: { farmName: true, farmLocation: true } },
                },
              },
              category: true,
            },
            take: 10,
          })
        : [],
      type === 'all' || type === 'farmer'
        ? prisma.farmerProfile.findMany({
            where: {
              OR: [
                { farmName: { contains: query, mode: 'insensitive' } },
                { farmDescription: { contains: query, mode: 'insensitive' } },
                { user: { fullName: { contains: query, mode: 'insensitive' } } },
              ],
            },
            include: {
              user: { select: { id: true, fullName: true, avatar: true } },
            },
            take: 10,
          })
        : [],
      type === 'all' || type === 'buyer'
        ? prisma.user.findMany({
            where: {
              AND: [
                { role: 'BUYER' },
                { fullName: { contains: query, mode: 'insensitive' } },
              ],
            },
            select: {
              id: true,
              fullName: true,
              avatar: true,
              email: true,
            },
            take: 10,
          })
        : [],
    ]);

    sendSuccess(res, 200, 'Search results', {
      products,
      farmers,
      buyers,
    });
  } catch (error) {
    sendSuccess(res, 200, 'Search results', {
      products: [],
      farmers: [],
      buyers: [],
    });
  }
});

export default router;
