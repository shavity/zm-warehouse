import { addRoom, getRooms } from '@controllers/rooms';
import { Router } from 'express';

const router = Router();

router.get('/', getRooms);
router.post('/', addRoom);

export default router;
