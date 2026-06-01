import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import prisma from '../config/database.js';
import { sendSuccess } from '../utils/response.js';

const router = express.Router();

router.post('/signup', authController.signupValidation, authController.signup);
router.post('/login', authController.loginValidation, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
//router.get('/me', authMiddleware, authController.me);

//added cache control headers to prevent caching of user data
router.get('/me', authMiddleware, async (req: any, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    include: {
      farmerProfile: true,
    },
  });

  return sendSuccess(res, 200, 'User fetched', user);
});

export default router;
