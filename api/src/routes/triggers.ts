import { Router } from "express";
import { TriggersController } from '@app/controllers/triggers'
import { requireAuth } from '@app/middleware/auth';

const router = Router();

router.get('/', requireAuth, TriggersController.index);
router.post('/', requireAuth, TriggersController.create);
router.delete('/:id', requireAuth, TriggersController.destroy);

export default router;
