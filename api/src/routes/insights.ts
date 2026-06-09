import { Router } from "express";
import { requireAuth } from "@app/middleware/auth";
import { InsightsController } from "@app/controllers/insights";

const router = Router();

router.get("/", requireAuth, InsightsController.index);

export default router;
