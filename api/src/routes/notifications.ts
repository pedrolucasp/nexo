import { Router } from "express";
import { requireAuth } from "@app/middleware/auth";
import { NotificationsController } from "@app/controllers/notifications";

const router = Router();

router.get("/", requireAuth, NotificationsController.index);

export default router;
