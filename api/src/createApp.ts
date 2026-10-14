import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mainRouter from "@app/routes/main";
import userRouter from "@app/routes/users";
import authRouter from "@app/routes/auth";
import moodRouter from "@app/routes/moods";
import triggerRouter from "@app/routes/triggers";
import sleepRecordRouter from "@app/routes/sleepRecords";
import insightRouter from "@app/routes/insights";
import careActionsRouter from "@app/routes/careActions";
import medicineRegimensRouter from "@app/routes/medicineRegimens";
import exportsRouter from "@app/routes/exports";
import reportRouter from "@app/reports/report.router";
import { errorHandler } from "@app/middleware/errorHandler";
import { logger } from "@app/lib/logger";
import { PrismaClient } from "@prisma/client";
import {
  bootWorkers,
  closeAllWorkers,
  closeAllQueues,
  scheduleInsights,
} from "@app/lib/queue";

import pinoHttp from "pino-http";
import { randomUUID } from "crypto";
import path from "path";

export function createApp() {
  const app = express();
  bootWorkers();
  scheduleInsights();

  // Use pino-http for HTTP logging (better than Morgan for structured logs)
  // Registered before the rest so every request has a logger attached,
  // including errors raised by the CORS and body-parsing middleware below
  app.use(
    pinoHttp({
      logger,
      genReqId: (req, res) => {
        const header = req.headers["x-request-id"];
        const requestId =
          (Array.isArray(header) ? header[0] : header) || randomUUID();

        res.setHeader("X-Request-Id", requestId);

        return requestId;
      },
    }),
  );

  // Configure CORS
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "*",
      credentials: true,
    }),
  );

  app.use(bodyParser.json());

  app.use("/users", userRouter);
  app.use("/auth", authRouter);
  app.use("/moods", moodRouter);
  app.use("/sleep_records", sleepRecordRouter);
  app.use("/triggers", triggerRouter);
  app.use("/insights", insightRouter);
  app.use("/care-actions", careActionsRouter);
  app.use("/medicine-regimens", medicineRegimensRouter);
  app.use("/exports", exportsRouter);
  app.use("/reports", reportRouter);

  app.use(errorHandler); // always last

  // TODO: flesh the actual page here
  app.use(express.static(path.join(__dirname, "./static")));
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "./static/index.html"));
  });

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  return app;
}

const shutdown = async () => {
  await Promise.all([closeAllWorkers(), closeAllQueues()]);
  process.exit(0);
};
