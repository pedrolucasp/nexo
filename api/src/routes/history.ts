import { Router } from "express";

import { requireAuth } from "@app/middleware/auth";
import { HistoryController } from "@app/controllers/history";

const router = Router();

router.get("/", requireAuth, HistoryController.index);

export default router;
