import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@app/middleware/auth";
import { InsightType } from "@prisma/client";
import { getInsightsByUserId } from "@app/services/insight.service";
import { parseAppDay } from "@app/lib/queue/processors/insights/utils";
import { InsightsQuerySchema } from "@app/schemas";
import { formatValidationError } from "@app/lib/errors/validationError";

const DAILY_INSIGHT_TYPES = new Set<InsightType>([
  InsightType.DAILY_ENERGY,
  InsightType.DAILY_SLEEP,
]);

// A day with no explicit date means "today" for the daily insight types, so the
// client never computes a day boundary; other types stay unfiltered
function resolveInsightDay(
  type?: InsightType,
  day?: string,
): Date | undefined {
  if (day) return parseAppDay(day);

  return type && DAILY_INSIGHT_TYPES.has(type) ? new Date() : undefined;
}

export const InsightsController = {
  index: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const parsedQuery = InsightsQuerySchema.safeParse(req.query);

      if (!parsedQuery.success) {
        return res.status(400).json(formatValidationError(parsedQuery.error));
      }

      const { type, period, limit, day } = parsedQuery.data;

      const insights = await getInsightsByUserId(req.userId!, {
        type,
        period,
        limit,
        day: resolveInsightDay(type, day),
      });

      return res.status(200).json({ insights });
    } catch (err) {
      next(err);
    }
  },
};
