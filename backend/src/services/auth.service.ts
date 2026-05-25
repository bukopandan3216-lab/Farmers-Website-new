import prisma from '../config/database.js';
import { hashPassword, comparePasswords } from '../utils/password.js';
import crypto from 'crypto';
import { generateRefreshToken, generateToken, verifyRefreshToken } from '../utils/jwt.js';
import { createError } from '../utils/errors.js';

export interface SignupInput {
  email: string;
  fullName: string;
  password: string;
  role?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const authService = {
  async signup(input: SignupInput) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw createError(400, 'Email already registered', {
        email: ['This email is already in use'],
      });
    }

    // Hash password
    const passwordHash = await hashPassword(input.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: input.email,
        fullName: input.fullName,
        passwordHash,
        role: (input.role?.toUpperCase() as any) || 'BUYER',
      },
    });

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const token = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);
    await this.storeRefreshToken(user.id, refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      token,
      refreshToken,
    };
  },

  async login(input: LoginInput) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw createError(401, 'Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await comparePasswords(
      input.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw createError(401, 'Invalid email or password');
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const token = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);
    await this.storeRefreshToken(user.id, refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      token,
      refreshToken,
    };
  },

  async refresh(refreshToken: string) {
    const decoded = verifyRefreshToken(refreshToken);
    const tokenHash = this.hashToken(refreshToken);
    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw createError(401, 'Invalid refresh token');
    }

    const payload = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
    const token = generateToken(payload);
    return { token };
  },

  async logout(refreshToken?: string) {
    if (!refreshToken) return;
    await prisma.refreshToken.updateMany({
      where: { tokenHash: this.hashToken(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatar: true,
        phone: true,
        address: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw createError(404, 'User not found');
    }

    return user;
  },

  hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  },

  async storeRefreshToken(userId: string, refreshToken: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(refreshToken),
        expiresAt,
      },
    });
  },
};
