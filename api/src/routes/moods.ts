import { Router } from "express";
import { MoodsController } from '@app/controllers/moods'
import { requireAuth } from '@app/middleware/auth';

const router = Router();

router.get('/', MoodsController.index);
router.post('/', requireAuth, MoodsController.create);

export default router;
