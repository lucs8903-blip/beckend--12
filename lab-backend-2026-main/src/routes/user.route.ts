import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();
const userController = new UserController();

router.get('/', userController.getAllUsers);
router.get('/:id', authenticate, userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', authenticate, userController.deleteUser);

export default router;