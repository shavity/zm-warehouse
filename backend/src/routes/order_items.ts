import { Router } from 'express';
import { getOrderItems, addOrderItem, editOrderItem, removeOrderItem } from '@controllers/order_items';

const router = Router({ mergeParams: true });

router.get('/', getOrderItems);
router.post('/', addOrderItem);
router.patch('/:product_id', editOrderItem);
router.delete('/:product_id', removeOrderItem);

export default router;
