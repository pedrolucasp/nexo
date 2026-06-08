import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import mainRouter from '@app/routes/main';
import userRouter from '@app/routes/users';
import authRouter from '@app/routes/auth';
import moodRouter from '@app/routes/moods';
import triggerRouter from '@app/routes/triggers';
import sleepRecordRouter from '@app/routes/sleepRecords';
import { errorHandler } from '@app/middleware/errorHandler';
import { PrismaClient } from '@prisma/client';
import { bootWorkers, closeAllWorkers, closeAllQueues } from '@app/lib/queue';
import pino from 'pino';
import pinoHttp from 'pino-http';
import path from 'path';

export function createApp() {
  const app = express();
  bootWorkers();

  // Configure CORS
  app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
  }));

  app.use(bodyParser.json());

  const isDev = process.env.NODE_ENV !== 'production';

  const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    ...(isDev && {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          singleLine: false,
          messageFormat: '{if levelLabel}{levelLabel} - {end}{msg}',
        },
      },
    }),
  });

  // Use pino-http for HTTP logging (better than Morgan for structured logs)
  app.use(pinoHttp({ logger }));

  app.use("/users", userRouter);
  app.use("/auth", authRouter);
  app.use("/moods", moodRouter);
  app.use("/sleep_records", sleepRecordRouter);
  app.use("/triggers", triggerRouter);

  app.use(errorHandler); // always last

  // TODO: flesh the actual page here
  app.use(express.static(path.join(__dirname, './static')));
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, './static/index.html')); });

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  return app;
}

const shutdown = async () => {
  await Promise.all([closeAllWorkers(), closeAllQueues()]);
  process.exit(0);
};
