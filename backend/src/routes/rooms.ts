import { Router } from 'express';
import { getRooms, addRoom } from '../controllers/rooms';

const router = Router();

router.get('/', getRooms);
router.post('/', addRoom);

export default router;