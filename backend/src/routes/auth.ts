import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', authController.signupValidation, authController.signup);
router.post('/login', authController.loginValidation, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authMiddleware, authController.me);

export default router;
