import { Request, Response, NextFunction } from 'express';
import {
  generateToken
} from '@app/services/auth.service';

import { getQueue, MailJobName } from '@app/lib/queue';

import {
  CreateUserSchema,
  UpdateUserSchema
} from '@app/schemas';

import {
  createUser,
  findUserById,
  findUserByEmail,
  updateUser
} from '@app/services/user.service';

import {
  storeActivationCode
} from '@app/services/auth.service';

import {
  AuthenticatedRequest
} from '@app/middleware/auth';

import { prisma } from '@app/lib/prisma';
import s3 from '@app/lib/s3';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import { addMinutes } from 'date-fns';

// XXX: I've regreted already
interface SingleFileRequest extends AuthenticatedRequest {
  file?: any;
}

export const UsersController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = CreateUserSchema.safeParse(req.body.user);

      if (!parsed.success) {
        return res.status(422).json({
          errors: parsed.error!.issues
        })
      }

      const user = await createUser(parsed.data);
      const jwtToken = generateToken(user.id, user.email);

      const code = [...Array(6)].map(() => crypto.randomInt(100))
        .join(" ");

      const expiresAt = addMinutes(new Date(), 5);
      await storeActivationCode(user.id, code, expiresAt);

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

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const parsed = UpdateUserSchema.safeParse(req.body.user);
      if (!parsed.success) {
        return res.status(400).json({
          errors: parsed.error!.issues
        });
      }

      const user = await findUserById(Number(id));

      if (!user) {
        return res.status(404).json({
          error: "Usuário não encontrado"
        });
      }

      const updated = await updateUser(parsed.data);

      // TODO: Drop encrypted password & token here
      return res.status(200).json({
        user: updated
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
