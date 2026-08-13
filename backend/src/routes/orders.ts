import { addOrder, editOrder, getOrder, getOrders, removeOrder } from '@controllers/orders';
import { Router } from 'express';

const router = Router();

router.get('/', getOrders);
router.get('/:id', getOrder);
router.post('/', addOrder);
router.patch('/:id', editOrder);
router.delete('/:id', removeOrder);

export default router;