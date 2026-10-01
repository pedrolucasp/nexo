import { Request, Response, NextFunction } from 'express';
import {
  generateToken
} from '@app/services/auth.service';

import { getQueue, MailJobName } from '@app/lib/queue';

import {
  CreateUserSchema,
  UpdateUserSchema,
  UpdateUserPreferencesSchema,
} from '@app/schemas';
import { formatValidationError } from '@app/lib/errors/validationError';
import { syncDailyReminderJob } from '@app/services/dailyReminder.sync';

import {
  createUser,
  findUserById,
  findUserByEmail,
  updateUser
} from '@app/services/user.service';

import {
  issueActivationCode
} from '@app/services/auth.service';

import {
  AuthenticatedRequest
} from '@app/middleware/auth';

import { prisma } from '@app/lib/prisma';
import s3 from '@app/lib/s3';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { User } from '@prisma/client';

// XXX: I've regreted already
interface SingleFileRequest extends AuthenticatedRequest {
  file?: any;
}

const withoutSecrets = (user: User) => {
  const {
    encryptedPassword,
    passwordResetToken,
    passwordResetExpires,
    ...safe
  } = user;

  return safe;
};

export const UsersController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = CreateUserSchema.safeParse(req.body.user);

      if (!parsed.success) {
        return res.status(400).json(formatValidationError(parsed.error!));
      }

      const user = await createUser(parsed.data);
      const jwtToken = generateToken(user.id, user.email);

      const code = await issueActivationCode(user.id);

      const mailQueue = getQueue('mail');
      const job = await mailQueue.add(MailJobName.WelcomeEmail, {
        userId: user.id,
        code: code
      });

      res.status(201).json({
        token: jwtToken
      });
    } catch (err) {
      next(err);
    }
  },

  update: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const targetId = Number(req.params.id);

      if (targetId !== req.userId) {
        return res.status(403).json({
          error: "Você só pode atualizar o próprio perfil"
        });
      }

      const parsed = UpdateUserSchema.safeParse(req.body.user);
      if (!parsed.success) {
        return res.status(400).json(formatValidationError(parsed.error!));
      }

      const user = await findUserById(targetId);

      if (!user) {
        return res.status(404).json({
          error: "Usuário não encontrado"
        });
      }

      const updated = await updateUser({ ...parsed.data, id: targetId });

      return res.status(200).json({
        user: withoutSecrets(updated)
      });
    } catch (err) {
      next(err);
    }
  },

  updateAvatar: async (req: SingleFileRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const currentUser = await findUserById(Number(req.userId));
      if (currentUser?.avatarKey) {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET!, Key: currentUser?.avatarKey!
          })
        );
      }

      const user = await prisma.user.update({
        where: {
          id: currentUser?.id
        }, data: {
          avatarURL: req.file.location,
          avatarKey: req.file.key
        }
      });

      res.json({
        message: 'File uploaded successfully',
        fileLocation: req.file.location,
        key: req.file.key,
        filename: req.file.originalname,
        size: req.file.size,
        user: user
      });
    } catch (err) {
      next(err);
    }
  },

  updatePreferences: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = UpdateUserPreferencesSchema.safeParse(req.body.user);
      if (!parsed.success) {
        return res.status(400).json(formatValidationError(parsed.error!));
      }

      const user = await prisma.user.update({
        where: { id: req.userId },
        data: parsed.data,
      });

      await syncDailyReminderJob(user);

      return res.status(200).json({ user });
    } catch (err) {
      next(err);
    }
  },

  me: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId! },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          updatedAt: true,
          avatarKey: true,
          avatarURL: true,
          active: true,
          pushToken: true,
          notificationsEnabled: true,
          dailyReminderTime: true,
        },
      });

      if (!user) return res.status(404).json({ error: "User not found" });

      return res.json({ user });
    } catch (err) {
      next(err);
    }
  },

  removeAvatar: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const currentUser = await findUserById(Number(req.userId));

    if (currentUser && currentUser?.avatarKey == null) {
      return res.json({ user: currentUser })
    }

    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET!, Key: currentUser?.avatarKey!
      })
    );

    const user = await prisma.user.update({
      where: {
        id: req.userId
      }, data: {
        avatarURL: null,
        avatarKey: null
      }
    });

    return res.json({
      user
    })
  }
}
