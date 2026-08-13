import {
    addUser,
    editUser,
    getUser,
    getUsers,
    removeUser,
} from '@controllers/users';
import { Router } from 'express';

const router = Router();

router.get('/', getUsers);
router.get('/:id', getUser);
router.post('/', addUser);
router.patch('/:id', editUser);
router.delete('/:id', removeUser);

export default router;
