import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import mainRouter from '@app/routes/main';
import userRouter from '@app/routes/users';
import authRouter from '@app/routes/auth';
import { errorHandler } from '@app/middleware/errorHandler';
import { PrismaClient } from '@prisma/client';
import { bootWorkers, closeAllWorkers, closeAllQueues } from '@app/lib/queue';

export function createApp() {
  const app = express();
  bootWorkers();

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

  app.get('/', mainRouter);
  app.use("/users", userRouter);
  app.use("/auth", authRouter);

  app.use(errorHandler); // always last

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  return app;
}

const shutdown = async () => {
  await Promise.all([closeAllWorkers(), closeAllQueues()]);
  process.exit(0);
};
