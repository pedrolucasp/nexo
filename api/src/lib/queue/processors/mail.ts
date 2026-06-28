import { Job } from "bullmq";
import {
  MailJobName,
  MailJobData,
  WelcomeEmailPayload,
  PasswordResetPayload,
  ActivateAccountEmailPayload,
} from "@app/lib/queue/types";

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
      console.log("Dispatching an welcome email", data);

      await sendWelcomeEmail(Number(data.userId), data.code);

      break;
    }

    case MailJobName.ActivateAccountEmail: {
      const data = job.data as ActivateAccountEmailPayload;
      console.log("Dispatching an activate account email", data);

      await sendActivateAccountEmail(Number(data.userId), data.code);

      break;
    }

    case MailJobName.PasswordReset: {
      const data = job.data as PasswordResetPayload;
      console.log("Dispatching an welcome email", data);

      await sendResetPasswordEmail(data.userId, data.token);

      break;
    }

    default:
      throw new Error(`Unknown mail job: ${job.name}`);
  }
}
