import { Response, NextFunction } from "express";

import { AuthenticatedRequest } from "@app/middleware/auth";
import { HistoryQuerySchema } from "@app/schemas";
import { formatValidationError } from "@app/lib/errors/validationError";
import { getHistoryByUserId } from "@app/services/history.service";

export const HistoryController = {
  index: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const parsedQuery = HistoryQuerySchema.safeParse(req.query);

      if (!parsedQuery.success) {
        return res.status(400).json(formatValidationError(parsedQuery.error));
      }

      const { limit, type, cursor } = parsedQuery.data;

      const page = await getHistoryByUserId(req.userId!, {
        limit,
        type,
        cursor,
      });

      return res.status(200).json(page);
    } catch (err) {
      next(err);
    }
  },
};
