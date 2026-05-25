import jwt, { SignOptions } from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRE_IN = process.env.JWT_EXPIRE_IN || '7d';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || `${JWT_SECRET}-refresh`;
const REFRESH_EXPIRE_IN = process.env.JWT_REFRESH_EXPIRE_IN || '30d';

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE_IN } as SignOptions);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRE_IN } as SignOptions);
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

export const decodeToken = (token: string): TokenPayload | null => {
  try {
    return jwt.decode(token) as TokenPayload | null;
  } catch (error) {
    return null;
  }
};
