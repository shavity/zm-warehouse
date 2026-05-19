import { Router } from 'express';
import { getUsers, getUser, addUser, editUser, removeUser } from '@controllers/users';

const router = Router();

router.get('/', getUsers);
router.get('/:id', getUser);
router.post('/', addUser);
router.patch('/:id', editUser);
router.delete('/:id', removeUser);

export default router;