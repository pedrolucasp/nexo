import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set');
}

const JWT_EXPIRES_IN = '7d';

interface TokenPayload {
  userId: number;
  email: string;
}

export const generateToken = (userId: number, email: string): string => {
  const payload: TokenPayload = { userId, email };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as TokenPayload;
};

export const generatePasswordResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const getPasswordResetExpiration = (): Date => {
  const expirationTime = new Date();
  expirationTime.setHours(expirationTime.getHours() + 1); // 1 hour from now
  return expirationTime;
};

export const isTokenExpired = (expirationDate: Date): boolean => {
  return new Date() > expirationDate;
};
