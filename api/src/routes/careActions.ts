import { Router } from 'express';
import { CareActionsController } from '@app/controllers/careActions';
import { requireAuth } from '@app/middleware/auth';

const router = Router();

router.get('/', requireAuth, CareActionsController.index);
router.post('/', requireAuth, CareActionsController.create);
router.get('/:id', requireAuth, CareActionsController.show);
router.patch('/:id', requireAuth, CareActionsController.patch);
router.delete('/:id', requireAuth, CareActionsController.destroy);

export default router;
