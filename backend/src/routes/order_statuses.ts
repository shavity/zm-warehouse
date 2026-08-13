import { getOrderStatuses } from '@controllers/order_statuses';
import { Router } from 'express';

const router = Router();

router.get('/', getOrderStatuses);

export default router;
