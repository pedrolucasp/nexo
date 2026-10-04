import { Router } from "express";

import { ExportsController } from "@app/controllers/exports";
import { requireAuth } from "@app/middleware/auth";

const router = Router();

router.post("/", requireAuth, ExportsController.create);

export default router;
