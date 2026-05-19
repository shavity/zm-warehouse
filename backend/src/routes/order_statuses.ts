import { Router } from 'express';
import { getOrderStatuses } from '@controllers/order_statuses';

const router = Router();

router.get('/', getOrderStatuses);

export default router;
