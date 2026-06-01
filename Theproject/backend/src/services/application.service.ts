import { PrismaClient, ApplicationStatus } from '@prisma/client';

import prisma from '../config/database.js';
import { createError } from '../utils/errors.js';
import { hashPassword } from '../utils/password.js';
import crypto from 'crypto';
import { emailService } from '../config/email.js';

export const applicationService = {
  async submitApplication(data: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    role: 'BUYER' | 'FARMER' | 'ADMIN';
    notificationPreference: 'EMAIL' | 'PHONE';
    commissionFrequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    farmName?: string;
    farmAddress?: string;
    description?: string;
    profileImageUrl?: string;
    validIdUrl?: string;
    photoWithIdUrl?: string;
    businessPermitUrl?: string;
  }) {
    // Check if email already exists in applications
    const existingApplication = await prisma.application.findUnique({
      where: { email: data.email },
    });

    if (existingApplication) {
      throw createError(
        409,
        'An application with this email already exists. Please check your inbox for updates or contact support.'
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw createError(409, 'An account with this email already exists. Please log in instead.');
    }

    // Create application (NOT user account yet)
    const application = await prisma.application.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        role: data.role,
        notificationPreference: data.notificationPreference,
        commissionFrequency: data.commissionFrequency || 'MONTHLY',
        farmName: data.farmName || null,
        farmAddress: data.farmAddress || null,
        description: data.description || null,
        photoWithIdUrl: data.photoWithIdUrl || null,
        profileImageUrl: data.profileImageUrl || null,
        validIdUrl: data.validIdUrl || null,
        businessPermitUrl: data.businessPermitUrl || null,
        status: 'PENDING',
      },
    });

    return {
      id: application.id,
      email: application.email,
      status: application.status,
      message: 'Your application has been submitted successfully. We will review your information and send you an account creation link when approved.',
    };
  },

  async getApplicationById(id: string) {
    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw createError(404, 'Application not found');
    }

    return application;
  },

  async getAllApplications(
    status?: 'PENDING' | 'APPROVED' | 'REJECTED',
    skip = 0,
    take = 20
  ) {
    const where: any = {};

    if (status) {
      where.status = status;
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.application.count({ where }),
    ]);

    return {
      applications,
      total,
      skip,
      take,
      pages: Math.ceil(total / take),
    };
  },

  async approveApplication(applicationId: string) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw createError(404, 'Application not found');
    }

    if (application.status !== 'PENDING') {
      throw createError(400, 'Only pending applications can be approved');
    }

    // Check if user already exists with this email
    const existingUser = await prisma.user.findUnique({
      where: { email: application.email },
    });

    if (existingUser) {
      throw createError(409, 'User with this email already exists');
    }

    const placeholderPassword = crypto.randomBytes(24).toString('hex');
    const placeholderHash = await hashPassword(placeholderPassword);

    const user = await prisma.user.create({
      data: {
        email: application.email,
        fullName: application.fullName,
        passwordHash: placeholderHash,
        phone: application.phone,
        address: application.address,
        avatar: application.profileImageUrl || null,
        role: application.role,
        accountSetupCompleted: false,
        cart: {
          create: {},
        },
      },
    });

    if (application.role === 'FARMER') {
      await prisma.farmerProfile.create({
        data: {
          userId: user.id,
          farmName: application.farmName || 'Farm',
          farmDescription: application.description || null,
          farmLocation: application.farmAddress || application.address,
          coverImage: null,
          commissionFrequency: application.commissionFrequency || 'MONTHLY',
        },
      });
    }

    // Update application status to APPROVED
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: 'APPROVED',
      },
    });

    // Generate a one-time registration token (24h expiry) and persist it
    const token = crypto.randomBytes(32).toString('hex');
    // TTL configurable via env var (days). Default to 30 days for account creation links.
    const ttlDays = parseInt(process.env.REGISTRATION_TOKEN_TTL_DAYS || '30', 10);
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

    try {
      await prisma.registrationToken.create({
        data: {
          token,
          userId: user.id,
          expiresAt,
        },
      });
    } catch (err) {
      console.error('Failed to persist registration token:', err);
    }

    // Send approval notification with account creation link (non-blocking)
    const accountCreationLink = `${process.env.FRONTEND_URL || 'https://farmdirect.com'}/create-account?token=${token}`;
    emailService.sendApprovalNotification(
      application.email,
      application.phone,
      application.fullName,
      application.role,
      (application as any).notificationPreference,
      accountCreationLink
    ).catch((err) => {
      console.error('Failed to send approval notification:', err);
    });

    // return the created placeholder user so callers can update UI without refetch
    return {
      application: updatedApplication,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        accountSetupCompleted: user.accountSetupCompleted,
        createdAt: user.createdAt,
      },
      message: 'Application approved. Account creation link sent to applicant.',
    };
  },

  async createAccountAfterApproval(applicationId: string, password: string, storeName?: string) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw createError(404, 'Application not found');
    }

    if (application.status !== 'APPROVED') {
      throw createError(400, 'Application must be approved before account creation');
    }

    // Validate password
    if (!password || password.length < 8) {
      throw createError(400, 'Password must be at least 8 characters');
    }

    const hashedPassword = await hashPassword(password);

    const result = await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: { email: application.email },
      });

      if (existingUser && existingUser.accountSetupCompleted) {
        throw createError(409, 'Account has already been created for this application');
      }

      const user = existingUser
        ? await tx.user.update({
            where: { id: existingUser.id },
            data: {
              passwordHash: hashedPassword,
              accountSetupCompleted: true,
              fullName: application.fullName,
              avatar: application.profileImageUrl || existingUser.avatar || null,
            },
          })
        : await tx.user.create({
            data: {
              email: application.email,
              fullName: application.fullName,
              passwordHash: hashedPassword,
              phone: application.phone,
              address: application.address,
              avatar: application.profileImageUrl || null,
              role: application.role,
              accountSetupCompleted: true,
              cart: {
                create: {},
              },
            },
          });

      if (application.role === 'FARMER') {
        const existingProfile = await tx.farmerProfile.findUnique({
          where: { userId: user.id },
        });

        if (existingProfile) {
          await tx.farmerProfile.update({
            where: { userId: user.id },
            data: {
              farmName: application.farmName || storeName || existingProfile.farmName || 'Farm',
              farmDescription: application.description || null,
              farmLocation: application.farmAddress || application.address,
            },
          });
        } else {
          await tx.farmerProfile.create({
            data: {
              userId: user.id,
              farmName: application.farmName || storeName || 'Farm',
              farmDescription: application.description || null,
              farmLocation: application.farmAddress || application.address,
              coverImage: null,
              commissionFrequency: application.commissionFrequency || 'MONTHLY',
            },
          });
        }
      }

      await tx.application.update({
        where: { id: applicationId },
        data: {
          status: 'APPROVED',
        },
      });

      return user;
    });

    return {
      user: {
        id: result.id,
        email: result.email,
        fullName: result.fullName,
        role: result.role,
        accountSetupCompleted: result.accountSetupCompleted,
       // accountSetupCompleted: result.accountSetupCompleted,
      },
      message: 'Account created successfully. Please log in with your credentials.',
    };
  },

  async createAccountWithToken(token: string, password: string, storeName?: string) {
    if (!token) throw createError(400, 'Token is required');
    if (!password || password.length < 8) throw createError(400, 'Password must be at least 8 characters');

    const reg = await prisma.registrationToken.findUnique({ where: { token } });
    if (!reg) throw createError(404, 'Invalid or expired token');
    if (reg.used) throw createError(400, 'Token has already been used');
    if (reg.expiresAt < new Date()) throw createError(400, 'Token has expired');
    if (reg.attempts >= 3) throw createError(400, 'Maximum attempts exceeded. Please request a new token.');

    const hashedPassword = await hashPassword(password);

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Increment attempts counter
        await tx.registrationToken.update({
          where: { id: reg.id },
          data: { attempts: { increment: 1 } },
        });

        const user = await tx.user.update({
          where: { id: reg.userId },
          data: {
            passwordHash: hashedPassword,
            accountSetupCompleted: true,
          },
        });

        // create farmer profile if necessary
        if (user.role === 'FARMER') {
          const existingProfile = await tx.farmerProfile.findUnique({ where: { userId: user.id } });
          if (!existingProfile) {
            await tx.farmerProfile.create({
              data: {
                userId: user.id,
                farmName: storeName || 'Farm',
                farmLocation: user.address || 'Unknown',
                commissionFrequency: 'MONTHLY',
              },
            });
          }
        }

        // Mark as used only on success
        await tx.registrationToken.update({ where: { id: reg.id }, data: { used: true } });

        return user;
      });

      return {
        user: {
          id: result.id,
          email: result.email,
          fullName: result.fullName,
          role: result.role,
        },
        message: 'Account created successfully. Please log in with your credentials.',
      };
    } catch (error) {
      // On error, still increment attempts outside transaction
      await prisma.registrationToken.update({
        where: { id: reg.id },
        data: { attempts: { increment: 1 } },
      });
      throw error;
    }
  },

  async rejectApplication(applicationId: string, rejectionReason: string) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw createError(404, 'Application not found');
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw createError(400, 'Only pending applications can be rejected');
    }

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: 'REJECTED',
        rejectionReason,
      },
    });

    // Send rejection email (non-blocking)
    emailService.sendRejectionEmail(
      application.email,
      application.fullName,
      rejectionReason
    ).catch((err) => {
      console.error('Failed to send rejection email:', err);
    });

    return updatedApplication;
  },

  // Resend approval email and generate a fresh registration token for an approved application
  async resendApprovalEmail(applicationId: string) {
    const application = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!application) throw createError(404, 'Application not found');
    if (application.status !== 'APPROVED') throw createError(400, 'Only approved applications can be resent an approval email');

    // Find the user created during approval
    const existingUser = await prisma.user.findUnique({ where: { email: application.email } });
    if (!existingUser) throw createError(404, 'Associated user not found for this application');

    const token = crypto.randomBytes(32).toString('hex');
    const ttlDays = parseInt(process.env.REGISTRATION_TOKEN_TTL_DAYS || '30', 10);
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

    try {
      await prisma.registrationToken.create({
        data: { token, userId: existingUser.id, expiresAt },
      });
    } catch (err) {
      console.error('Failed to persist registration token (resend):', err);
      throw createError(500, 'Failed to generate registration token');
    }

    const accountCreationLink = `${process.env.FRONTEND_URL || 'https://farmdirect.com'}/create-account?token=${token}`;
    emailService.sendApprovalNotification(
      application.email,
      application.phone,
      application.fullName,
      application.role,
      (application as any).notificationPreference,
      accountCreationLink
    ).catch((err) => console.error('Failed to resend approval notification:', err));

    return { token, expiresAt };
  },
};
