import db from '@dal/database';
import { OrderStatus } from '@models/order_status';

export const getAllOrderStatuses = async (): Promise<OrderStatus[]> => {
    const result = await db.query('SELECT * FROM order_statuses ORDER BY id');
    return result.rows;
};

export const getOrderStatusById = async (id: number): Promise<OrderStatus | undefined> => {
    const result = await db.query(
        `SELECT * FROM order_statuses WHERE id = $1`,
        [id]
    );
    return result.rows[0];
};
