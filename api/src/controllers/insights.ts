import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@app/middleware/auth";
import { getInsightsByUserId } from "@app/services/insight.service";
import { InsightsQuerySchema } from "@app/schemas";

export const InsightsController = {
  index: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const parsedQuery = InsightsQuerySchema.safeParse(req.query);

      if (!parsedQuery.success) {
        return res.status(400).json({
          message: "Invalid query parameters",
          errors: parsedQuery.error.flatten(),
        });
      }

      const insights = await getInsightsByUserId(req.userId!, {
        type: parsedQuery.data.type,
        period: parsedQuery.data.period,
        limit: parsedQuery.data.limit,
      });

      return res.status(200).json({ insights });
    } catch (err) {
      next(err);
    }
  },
};
