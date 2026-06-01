import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth.js';
import { applicationService } from '../services/application.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

import prisma from '../config/database.js';
// Controller for handling user applications to become buyers or farmers added from claude
export const applicationController = {
  async submitApplication(req: AuthRequest, res: Response) {
    try {
      const {
        fullName,
        email,
        phone,
        address,
        role,
        notificationPreference,
        commissionFrequency,
        farmName,
        farmAddress,
        description,
        profileImageUrl,
        photoWithIdUrl,
        validIdUrl,
        businessPermitUrl,
      } = req.body;

      // Validation
      if (!fullName || !email || !phone || !address || !role || !notificationPreference) {
        return sendError(res, 400, 'Missing required fields');
      }

      if (!['BUYER', 'FARMER'].includes(role)) {
        return sendError(res, 400, 'Invalid role');
      }

      if (!['EMAIL', 'PHONE'].includes(notificationPreference)) {
        return sendError(res, 400, 'Invalid notification preference');
      }

      if (role === 'FARMER' && !farmName) {
        return sendError(res, 400, 'Farm name is required for farmer applications');
      }

      if (role === 'FARMER' && commissionFrequency && !['DAILY', 'WEEKLY', 'MONTHLY'].includes(commissionFrequency)) {
        return sendError(res, 400, 'Invalid commission frequency');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return sendError(res, 400, 'Invalid email format');
      }

      const application = await applicationService.submitApplication({
        fullName,
        email,
        phone,
        address,
        role,
        notificationPreference,
        commissionFrequency,
        farmName,
        farmAddress,
        description,
        profileImageUrl,
        photoWithIdUrl,
        validIdUrl,
        businessPermitUrl,
      });

      return sendSuccess(res, 201, 'Application submitted successfully', application);
    } catch (error: any) {
      console.error('Submit application error:', error);
      if (error.statusCode) {
        return sendError(res, error.statusCode, error.message);
      }
      return sendError(res, 500, 'Failed to submit application');
    }
  },

  async verifyToken(req: AuthRequest, res: Response) {
  try {
    const { token } = req.query as { token?: string };
    if (!token) return sendError(res, 400, 'Token is required');

    const reg = await (prisma as any).registrationToken.findUnique({ where: { token } });
    if (!reg) return sendError(res, 404, 'Invalid token');
    if (reg.used) return sendError(res, 400, 'This link has already been used');
    if (reg.expiresAt < new Date()) return sendError(res, 400, 'This link has expired');

    const user = await prisma.user.findUnique({
      where: { id: reg.userId },
      select: { fullName: true, role: true },
    });
    return sendSuccess(res, 200, 'Token is valid', { role: user?.role, fullName: user?.fullName });
  } catch (error: any) {
    console.error('Verify token error:', error);
    return sendError(res, 500, 'Failed to verify token');
  }
},

  async getApplication(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const application = await applicationService.getApplicationById(id);

      return sendSuccess(res, 200, 'Application retrieved successfully', application);
    } catch (error: any) {
      console.error('Get application error:', error);
      if (error.statusCode) {
        return sendError(res, error.statusCode, error.message);
      }
      return sendError(res, 500, 'Failed to retrieve application');
    }
  },

  async getAllApplications(req: AuthRequest, res: Response) {
    try {
      // Check if user is admin
      if (req.user?.role !== 'ADMIN') {
        return sendError(res, 403, 'Only admins can view all applications');
      }

      const status = req.query.status as string | undefined;
      const skip = parseInt(req.query.skip as string) || 0;
      const take = parseInt(req.query.take as string) || 20;

      const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
      if (status && !validStatuses.includes(status)) {
        return sendError(res, 400, 'Invalid status filter');
      }

      const result = await applicationService.getAllApplications(
        status as any,
        skip,
        take
      );

      return sendSuccess(res, 200, 'Applications retrieved successfully', result);
    } catch (error: any) {
      console.error('Get all applications error:', error);
      return sendError(res, 500, 'Failed to retrieve applications');
    }
  },

  async approveApplication(req: AuthRequest, res: Response) {
    try {
      // Check if user is admin
      if (req.user?.role !== 'ADMIN') {
        return sendError(res, 403, 'Only admins can approve applications');
      }

      const { id } = req.params;

      const result = await applicationService.approveApplication(id);

      return sendSuccess(res, 200, 'Application approved successfully', result);
    } catch (error: any) {
      console.error('Approve application error:', error);
      if (error.statusCode) {
        return sendError(res, error.statusCode, error.message);
      }
      return sendError(res, 500, 'Failed to approve application');
    }
  },

  async createAccountAfterApproval(req: AuthRequest, res: Response) {
    try {
      const { applicationId } = req.params;
      const { password, storeName } = req.body;

      if (!applicationId) {
        return sendError(res, 400, 'Application ID is required');
      }

      if (!password) {
        return sendError(res, 400, 'Password is required');
      }

      if (password.length < 8) {
        return sendError(res, 400, 'Password must be at least 8 characters');
      }

      const result = await applicationService.createAccountAfterApproval(
        applicationId,
        password,
        storeName
      );

      return sendSuccess(res, 201, 'Account created successfully', result);
    } catch (error: any) {
      console.error('Create account after approval error:', error);
      if (error.statusCode) {
        return sendError(res, error.statusCode, error.message);
      }
      return sendError(res, 500, 'Failed to create account');
    }
  },

  async createAccountWithToken(req: AuthRequest, res: Response) {
    try {
      const { token, password, storeName } = req.body;

      if (!token) return sendError(res, 400, 'Token is required');
      if (!password) return sendError(res, 400, 'Password is required');
      if (password.length < 8) return sendError(res, 400, 'Password must be at least 8 characters');

      const result = await applicationService.createAccountWithToken(token, password, storeName);

      return sendSuccess(res, 201, 'Account created successfully', result);
    } catch (error: any) {
      console.error('Create account with token error:', error);
      if (error.statusCode) {
        return sendError(res, error.statusCode, error.message);
      }
      return sendError(res, 500, 'Failed to create account');
    }
  },

  async resendApproval(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') return sendError(res, 403, 'Only admins can resend approval emails');
      const { id } = req.params;
      const result = await applicationService.resendApprovalEmail(id);
      return sendSuccess(res, 200, 'Approval email resent', result);
    } catch (error: any) {
      console.error('Resend approval error:', error);
      if (error.statusCode) return sendError(res, error.statusCode, error.message);
      return sendError(res, 500, 'Failed to resend approval email');
    }
  },

  async rejectApplication(req: AuthRequest, res: Response) {
    try {
      // Check if user is admin
      if (req.user?.role !== 'ADMIN') {
        return sendError(res, 403, 'Only admins can reject applications');
      }

      const { id } = req.params;
      const { rejectionReason } = req.body;

      if (!rejectionReason || typeof rejectionReason !== 'string') {
        return sendError(res, 400, 'Rejection reason is required');
      }

      const application = await applicationService.rejectApplication(id, rejectionReason);

      return sendSuccess(res, 200, 'Application rejected successfully', application);
    } catch (error: any) {
      console.error('Reject application error:', error);
      if (error.statusCode) {
        return sendError(res, error.statusCode, error.message);
      }
      return sendError(res, 500, 'Failed to reject application');
    }
  },
};
