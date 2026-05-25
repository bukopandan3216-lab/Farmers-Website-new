import { Request, Response, NextFunction } from 'express';
import { verifyToken, decodeToken } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';
import ApiError from '../utils/errors.js';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
  body: any;
  query: any;
  params: any;
  headers: any;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      sendError(res, 401, 'No token provided');
      return;
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    sendError(res, 401, 'Invalid or expired token');
    return;
  }
};

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(res, 403, 'Forbidden: Insufficient permissions');
      return;
    }

    next();
  };
};
