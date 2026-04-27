import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import userRouter from '@app/routes/users';
import authRouter from '@app/routes/auth';
import { errorHandler } from '@app/middleware/errorHandler';
import { PrismaClient } from '@prisma/client';

export function createApp() {
  const app = express();

  // Configure CORS
  app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
  }));

  app.use(bodyParser.json());

  // Only use morgan in non-test environments
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
  }

  app.use("/users", userRouter);
  app.use("/auth", authRouter);

  app.use(errorHandler); // always last

  return app;
}
