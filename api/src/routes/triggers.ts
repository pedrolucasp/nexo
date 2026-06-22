import { Router } from "express";
import { TriggersController } from '@app/controllers/triggers'
import { requireAuth } from '@app/middleware/auth';

const router = Router();

router.get('/', requireAuth, TriggersController.index);
router.get('/:id', requireAuth, TriggersController.show);
router.post('/', requireAuth, TriggersController.create);
router.put('/:id', requireAuth, TriggersController.update);
router.delete('/:id', requireAuth, TriggersController.destroy);

export default router;
