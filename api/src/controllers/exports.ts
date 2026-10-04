import { Response, NextFunction } from "express";

import { getQueue } from "@app/lib/queue";
import { ExportJobName } from "@app/lib/queue/types";
import { AuthenticatedRequest } from "@app/middleware/auth";

export const ExportsController = {
  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await getQueue("exports").add(ExportJobName.Data, {
        userId: req.userId!,
      });

      return res.status(202).json({
        message:
          "Tudo certo! Você receberá seus dados por e-mail em instantes.",
      });
    } catch (err) {
      next(err);
    }
  },
};
