import { Router } from "express";
import { UsersController } from '@app/controllers/users'

const router = Router();

router.post('/', UsersController.create);

export default router;
