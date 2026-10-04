import { Job } from "bullmq";

import {
  ExportJobData,
  ExportJobName,
  ExportPayload,
} from "@app/lib/queue/types";
import { buildExportArchive } from "@app/services/export/export.service";
import {
  sendExportFailedEmail,
  sendExportReadyEmail,
} from "@app/services/mail";

export async function exportProcessor(
  job: Job<ExportJobData["data"]>,
): Promise<void> {
  switch (job.name as ExportJobName) {
    case ExportJobName.Data: {
      const { userId } = job.data as ExportPayload;

      try {
        const archive = await buildExportArchive(userId);
        await sendExportReadyEmail(userId, archive);
      } catch (err) {
        // Only the last attempt notifies the user; earlier ones are retried
        const attempts = job.opts.attempts ?? 1;
        const isFinalAttempt = job.attemptsMade + 1 >= attempts;

        if (isFinalAttempt) {
          try {
            await sendExportFailedEmail(userId);
          } catch (mailErr) {
            console.error(
              `[exports] failed to send the failure email for user ${userId}:`,
              mailErr,
            );
          }
        }

        throw err;
      }

      break;
    }

    default:
      throw new Error(`Unknown export job: ${job.name}`);
  }
}
