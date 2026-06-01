import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth.js';
import { authService } from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const authController = {
  // Validation middlewares
  signupValidation: [
    body('email').isEmail().normalizeEmail(),
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],

  loginValidation: [
    body('email').trim().notEmpty().withMessage('Email or phone number is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],

  async signup(req: AuthRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 400, 'Validation failed', errors.mapped() as any);
      }

      const { email, fullName, password, role } = req.body;
      const result = await authService.signup({
        email,
        fullName,
        password,
        role,
      });

      sendSuccess(res, 201, 'User created successfully', result);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.statusCode, error.message, error.errors);
      } else {
        sendError(res, 500, 'Failed to create user');
      }
    }
  },

  async login(req: AuthRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 400, 'Validation failed', errors.mapped() as any);
      }

      const { email, password } = req.body;
      const result = await authService.login({ email, password });

      sendSuccess(res, 200, 'Login successful', result);
    } catch (error: any) {
      console.error('Login failed:', {
        message: error?.message,
        statusCode: error?.statusCode,
        stack: error?.stack,
      });
      if (error.statusCode) {
        sendError(res, error.statusCode, error.message, error.errors);
      } else {
        sendError(res, 500, 'Failed to login');
      }
    }
  },

  async me(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Unauthorized');
      }

      const user = await authService.getMe(req.user.userId);
      sendSuccess(res, 200, 'User fetched successfully', user);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.statusCode, error.message);
      } else {
        sendError(res, 500, 'Failed to fetch user');
      }
    }
  },

  async refresh(req: AuthRequest, res: Response) {
    try {
      const result = await authService.refresh(req.body.refreshToken);
      sendSuccess(res, 200, 'Token refreshed successfully', result);
    } catch (error: any) {
      sendError(res, error.statusCode || 401, error.message || 'Refresh failed');
    }
  },

  async logout(req: AuthRequest, res: Response) {
    await authService.logout(req.body.refreshToken);
    sendSuccess(res, 200, 'Logged out successfully');
  },
};
