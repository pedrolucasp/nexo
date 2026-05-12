import { Router } from "express";
import { MainController } from '@app/controllers/main'

const router = Router();

router.get('/', MainController.index);

export default router;
