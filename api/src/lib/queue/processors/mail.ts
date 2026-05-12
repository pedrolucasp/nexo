import { Job } from 'bullmq';
import {
  MailJobName, MailJobData,
  WelcomeEmailPayload,
  PasswordResetPayload,
} from '@app/lib/queue/types';

import {
  sendWelcomeEmail
} from '@app/services/mail'

export async function mailProcessor(job: Job<MailJobData['data']>): Promise<void> {
  // job.name is the discriminant
  switch (job.name as MailJobName) {
    case MailJobName.WelcomeEmail: {
      const data = job.data as WelcomeEmailPayload;
      // await sendWelcomeEmail(data.userId);

      console.log("Dispatching an welcome email", data);

      sendWelcomeEmail(Number(data.userId));

      break;
    }

    case MailJobName.PasswordReset: {
      const data = job.data as PasswordResetPayload;
      // await sendPasswordResetEmail(data.userId, data.token);
      break;
    }

    default:
      throw new Error(`Unknown mail job: ${job.name}`);
  }
}
