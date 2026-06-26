import { Router } from 'express';
import { MedicineRegimensController } from '@app/controllers/medicineRegimens';
import { requireAuth } from '@app/middleware/auth';

const router = Router();

router.get('/', requireAuth, MedicineRegimensController.index);
router.post('/', requireAuth, MedicineRegimensController.create);
router.patch('/:id', requireAuth, MedicineRegimensController.update);
router.delete('/:id', requireAuth, MedicineRegimensController.destroy);

export default router;
