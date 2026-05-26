import { Router } from "express";
import { SleepRecordsController } from '@app/controllers/sleepRecords'
import { requireAuth } from '@app/middleware/auth';

const router = Router();

router.get('/', requireAuth, SleepRecordsController.index);
router.post('/', requireAuth, SleepRecordsController.create);
router.delete('/:id', requireAuth, SleepRecordsController.destroy);

export default router;
