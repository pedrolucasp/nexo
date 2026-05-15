import { Request, Response, NextFunction } from 'express';
import {
  login,
  generateToken,
  requestPasswordReset,
  resetPassword,
} from '@app/services/auth.service';

import {
  verifyToken
} from '@app/lib/jwt';

import {
  findUserByEmail
} from '@app/services/user.service'

import {
  LoginSchema,
  PasswordResetSchema,
  PasswordResetRequestSchema
} from '@app/schemas';

export const AuthController = {
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = LoginSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          errors: parsed.error!.issues
        });
      }

      const { user, token } = await login(parsed.data);

      return res.json({
        token,
        user
      });
    } catch (err: any) {
      if (err.message === 'Invalid credentials') {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      next(err);
    }
  },

  forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {

      const parsed = PasswordResetRequestSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          errors: parsed.error!.issues
        });
      }

      const result = await requestPasswordReset(parsed.data);
      return res.status(200).json(result)
    } catch (err) {
      next(err);
    }
  },

  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = PasswordResetSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          errors: parsed.error!.issues
        });
      }

      const result = await resetPassword(parsed.data);
      return res.status(200).json(result);
    } catch (err: any) {
      if (err.message.includes('token')) {
        return res.status(400).json({ error: err.message });
      }
      next(err);
    }
  },

  verify: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.substring(7);
      const payload = verifyToken(token);
      const user = await findUserByEmail(payload.email);

      res.json({
        valid: true,
        userId: payload.userId,
        email: payload.email,
        user: {
          firstName: user?.firstName,
          email: user?.email,
          lastName: user?.lastName,
          updatedAt: user?.updatedAt
        }
      });
    } catch (err: any) {
      if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
      next(err);
    }
  }
};
