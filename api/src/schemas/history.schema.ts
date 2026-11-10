import { z } from "zod";

import {
  DEFAULT_HISTORY_LIMIT,
  HISTORY_KINDS,
  decodeHistoryCursor,
} from "@app/lib/history";

export const HistoryQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(DEFAULT_HISTORY_LIMIT),
  type: z.enum(HISTORY_KINDS).optional(),
  cursor: z
    .string()
    .min(1)
    .transform((value, ctx) => {
      const decoded = decodeHistoryCursor(value);

      if (!decoded) {
        ctx.addIssue({ code: "custom", message: "Invalid cursor" });

        return z.NEVER;
      }

      return decoded;
    })
    .optional(),
});

export type HistoryQueryInput = z.infer<typeof HistoryQuerySchema>;
