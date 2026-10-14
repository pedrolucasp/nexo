import { Job } from "bullmq";
import {
  MailJobName,
  MailJobData,
  WelcomeEmailPayload,
  PasswordResetPayload,
  ActivateAccountEmailPayload,
} from "@app/lib/queue/types";
import { logger } from "@app/lib/logger";

import {
  sendWelcomeEmail,
  sendResetPasswordEmail,
  sendActivateAccountEmail,
} from "@app/services/mail";

export async function mailProcessor(
  job: Job<MailJobData["data"]>,
): Promise<void> {
  // job.name is the discriminant
  switch (job.name as MailJobName) {
    case MailJobName.WelcomeEmail: {
      const data = job.data as WelcomeEmailPayload;
      logger.info({ userId: data.userId }, "[mail] dispatching welcome email");

      await sendWelcomeEmail(Number(data.userId), data.code);

      break;
    }

    case MailJobName.ActivateAccountEmail: {
      const data = job.data as ActivateAccountEmailPayload;
      logger.info(
        { userId: data.userId },
        "[mail] dispatching activation email",
      );

      await sendActivateAccountEmail(Number(data.userId), data.code);

      break;
    }

    case MailJobName.PasswordReset: {
      const data = job.data as PasswordResetPayload;
      logger.info(
        { userId: data.userId },
        "[mail] dispatching password reset email",
      );

      await sendResetPasswordEmail(data.userId, data.token);

      break;
    }

    default:
      throw new Error(`Unknown mail job: ${job.name}`);
  }
}
