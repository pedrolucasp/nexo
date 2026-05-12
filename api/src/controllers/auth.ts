import { Request, Response, NextFunction } from 'express';
import {
  authenticateUser,
  generateToken,
  initiatePasswordReset,
  resetPassword,
  findUserByEmail
} from '@app/models/user';

import {
  validateRequiredFields
} from '@app/utils/validators';

import { verifyToken } from '@app/lib/jwt';
import { getQueue, MailJobName } from '@app/lib/queue';

export const AuthController = {
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      const requiredValidation = validateRequiredFields(req.body, [
        'email', 'password'
      ]);

      if (!requiredValidation.valid) {
        return res.status(400).json({
          error: 'Missing required fields',
          missing: requiredValidation.missing
        });
      }

      const user = await authenticateUser(email, password);
      const jwtToken = generateToken(user.id, user.email);

      res.json({
        token: jwtToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
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
      const { email } = req.body;

      const requiredValidation = validateRequiredFields(req.body, ['email']);

      if (!requiredValidation.valid) {
        return res.status(400).json({
          error: 'Email is required',
          missing: requiredValidation.missing
        });
      }

      const result = await initiatePasswordReset(email);
      const mailQueue = getQueue('mail');
      const job = await mailQueue.add(MailJobName.PasswordReset, {
        userId: result.id,
        token: result.token
      });

      // In production, don't send token in response
      // Instead, send email with reset link
      res.json({
        message: 'Password reset instructions sent to your email',
        ...(!process.env.NODE_ENV || process.env.NODE_ENV === 'development' ? { token: result.token } : {})
      });
    } catch (err) {
      next(err);
    }
  },

  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, password } = req.body;

      const requiredValidation = validateRequiredFields(req.body, [
        'token', 'password'
      ]);

      if (!requiredValidation.valid) {
        return res.status(400).json({
          error: 'Missing required fields',
          missing: requiredValidation.missing
        });
      }

      await resetPassword(token, password);

      res.json({ message: 'Password successfully reset' });
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
