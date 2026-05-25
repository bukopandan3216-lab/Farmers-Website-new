import express from 'express';
import prisma from '../config/database.js';
import { sendSuccess } from '../utils/response.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  sendSuccess(res, 200, 'Categories fetched successfully', categories);
});

export default router;
