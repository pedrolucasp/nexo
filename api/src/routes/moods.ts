import { Router } from "express";
import { MoodsController } from '@app/controllers/moods'
import { requireAuth } from '@app/middleware/auth';

const router = Router();

router.get('/', requireAuth, MoodsController.index);
router.get('/:id', requireAuth, MoodsController.show);
router.post('/', requireAuth, MoodsController.create);

export default router;
