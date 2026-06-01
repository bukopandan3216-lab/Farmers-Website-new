import express from 'express';
import prisma from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = express.Router();

// Temporary debug endpoint to inspect DB connection and user count
router.get('/db', async (_req, res) => {
  try {
    // Get current database name and server version
    // Using raw query to fetch server-side metadata
    const dbNameRes: any = await prisma.$queryRaw`SELECT current_database() AS name`;
    const dbName = Array.isArray(dbNameRes) ? dbNameRes[0]?.name : dbNameRes?.name;

    const userCount = await prisma.user.count();

    sendSuccess(res, 200, 'DB info fetched', { database: dbName, userCount });
  } catch (err) {
    console.error('Debug /db failed', err);
    sendError(res, 500, 'Failed to fetch DB info');
  }
});

// Temporary unauthenticated endpoint to list users as the running backend sees them
router.get('/users', async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        accountSetupCompleted: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, 200, 'Users fetched (debug)', users);
  } catch (err) {
    console.error('Debug /users failed', err);
    sendError(res, 500, 'Failed to fetch users');
  }
});

router.get('/registration-tokens', async (_req, res) => {
  try {
    const tokens = await prisma.registrationToken.findMany({
      select: { id: true, token: true, userId: true, expiresAt: true, used: true, attempts: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, 200, 'Registration tokens fetched (debug)', tokens);
  } catch (err) {
    console.error('Debug /registration-tokens failed', err);
    sendError(res, 500, 'Failed to fetch registration tokens');
  }
});

export default router;
