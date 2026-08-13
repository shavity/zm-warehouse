import { addOrderItem, editOrderItem, getOrderItems, removeOrderItem } from '@controllers/order_items';
import { Router } from 'express';

const router = Router({ mergeParams: true });

router.get('/', getOrderItems);
router.post('/', addOrderItem);
router.patch('/:product_id', editOrderItem);
router.delete('/:product_id', removeOrderItem);

export default router;
