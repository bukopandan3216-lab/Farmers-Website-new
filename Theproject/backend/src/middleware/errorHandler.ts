import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';
import ApiError from '../utils/errors.js';

export const errorHandler = (
  error: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('[Error]', error);

  if (error instanceof ApiError) {
    sendError(res, error.statusCode, error.message, error.errors);
    return;
  }

  sendError(res, 500, 'Internal server error');
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  sendError(res, 404, `Route not found: ${req.method} ${req.path}`);
};
