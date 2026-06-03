import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@app/middleware/auth';

import {
  login,
  generateToken,
  requestPasswordReset,
  resetPassword,
  activateUser,
  storeActivationCode
} from '@app/services/auth.service';

import {
  verifyToken
} from '@app/lib/jwt';

import {
  findUserByEmail,
  findUserById,
  findUserByActivationCode,
} from '@app/services/user.service'

import {
  LoginSchema,
  PasswordResetSchema,
  PasswordResetRequestSchema,
  ActivateUserSchema
} from '@app/schemas';

import { addMinutes } from 'date-fns';
import { getQueue, MailJobName } from '@app/lib/queue';
import crypto from 'crypto';

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

      if (!user.active && (new Date() > new Date(user.activationCodeExpiresAt!))) {
        const code = [...Array(6)].map(() => crypto.randomInt(9))
        .join("");

        const expiresAt = addMinutes(new Date(), 5);
        await storeActivationCode(user.id, code, expiresAt);

        const mailQueue = getQueue('mail');
        const job = await mailQueue.add(MailJobName.ActivateAccountEmail, {
          userId: user.id,
          code: code
        });
      }

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

      if (!user) {
        // XXX: Investigate which actual cases this would happen
        // But the possible reason is that a token is living inside
        // the user's phone, but somehow he was banned/deleted
        return res.status(404).json({
          errors: "User does not exist anymore"
        });
      }

      res.json({
        valid: true,
        userId: payload.userId,
        email: payload.email,
        user: {
          firstName: user.firstName,
          email: user.email,
          lastName: user.lastName,
          updatedAt: user.updatedAt
        }
      });
    } catch (err: any) {
      if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
      next(err);
    }
  },

  activate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = ActivateUserSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          errors: parsed.error!.issues
        });
      }

      const user = await findUserByActivationCode(String(parsed.data.code));

      if (!user) {
        return res.status(422).json({
          error: "Código incorreto. Verifique o código e tente novamente"
        })
      }

      const result = await activateUser(user);

      return res.status(200).json({
        user: result
      });
    } catch (err: any) {
      next(err);
    }
  },

  resendActivationCode: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = await findUserById(req.userId!);

      if (!user) {
        return res.status(400).json({
          errors: "Usuário não encontrado"
        })
      }

      const code = [...Array(6)].map(() => crypto.randomInt(9))
      .join("");

      const expiresAt = addMinutes(new Date(), 5);
      await storeActivationCode(user.id, code, expiresAt);

      //const mailQueue = getQueue('mail');
      //const job = await mailQueue.add(MailJobName.ActivateAccountEmail, {
      //  userId: user.id,
      //  code: code
      //});

      res.json({
        user
      })
    } catch (err: any) {
      next(err);
    }
  }
};
