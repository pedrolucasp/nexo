import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@app/middleware/auth";
import { getNotificationsByUserId } from "@app/services/notification.service";
import { NotificationsQuerySchema } from "@app/schemas";
import { formatValidationError } from "@app/lib/errors/validationError";

export const NotificationsController = {
  index: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const parsedQuery = NotificationsQuerySchema.safeParse(req.query);

      if (!parsedQuery.success) {
        return res.status(400).json(formatValidationError(parsedQuery.error));
      }

      const { limit, cursor } = parsedQuery.data;

      const page = await getNotificationsByUserId(req.userId!, {
        limit,
        cursor,
      });

      return res.status(200).json(page);
    } catch (err) {
      next(err);
    }
  },
};
