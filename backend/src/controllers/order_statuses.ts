import { getAllOrderStatuses } from '@dal/order_statuses';
import { Request, Response } from 'express';

export const getOrderStatuses = async (req: Request, res: Response) => {
    try {
        const orderStatuses = await getAllOrderStatuses();
        res.json(orderStatuses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch order statuses' });
    }
};
