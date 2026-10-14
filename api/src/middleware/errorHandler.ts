import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client' // Bleh
import { isDomainError } from "@app/lib/errors/base";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  req.log.error({ err }, "request failed");

  if (isDomainError(err)) {
    return res.status(err.status)
      .json({ error: err.message });
  }

  // Prisma errors as a fallback (or map these to domain errors in the repo)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") return res.status(404)
      .json({ error: "Record not found" });

    if (err.code === "P2002") return res.status(409)
      .json({ error: "Unique constraint violation" });
  }
  
  res.status(500).json({ error: "Internal server error" });
}
