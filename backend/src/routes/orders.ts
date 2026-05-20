import { Router } from 'express';
import { getOrders, getOrder, addOrder, editOrder, removeOrder } from '@controllers/orders';

const router = Router();

router.get('/', getOrders);
router.get('/:id', getOrder);
router.post('/', addOrder);
router.patch('/:id', editOrder);
router.delete('/:id', removeOrder);

export default router;