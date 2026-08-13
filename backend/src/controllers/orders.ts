import { getOrderStatusById } from '@dal/order_statuses';
import { createOrder, deleteOrder, getAllOrders, getOrderById, updateOrder } from '@dal/orders';
import { getUserById } from '@dal/users';
import { idParser } from '@utils/parsers';
import { isNatural, isNonEmptyString, isValidDate } from '@utils/validators';
import { Request, Response } from 'express';

export const getOrders = async (req: Request, res: Response) => {
    try {
        const orders = await getAllOrders();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

export const getOrder = async (req: Request, res: Response) => {
    try {
        const id = idParser(req.params.id as string);
        if (id === null) {
            res.status(400).json({ error: 'id must be an integer' });
            return;
        }

        const order = await getOrderById(id);
        if (!order) {
            res.status(404).json({ error: `Order with id ${id} not found` });
            return;
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch order' });
    }
};

export const addOrder = async (req: Request, res: Response) => {
    try {
        const { name, created_by, status_id, start_date, expire_date } = req.body;

        if (!name || !created_by || !start_date || !status_id) {
            res.status(400).json({ error: 'name, created_by, status_id and start_date are required' });
            return;
        }

        if (!isNonEmptyString(name)) {
            res.status(400).json({ error: 'name must be a non-empty string' });
            return;
        }

        if (!isNatural(created_by)) {
            res.status(400).json({ error: 'created_by must be a positive integer' });
            return;
        }

        if (!isNatural(status_id)) {
            res.status(400).json({ error: 'status_id must be a positive integer' });
            return;
        }

        if (!isValidDate(start_date)) {
            res.status(400).json({ error: 'start_date must be a valid date' });
            return;
        }

        if (expire_date !== undefined && !isValidDate(expire_date)) {
            res.status(400).json({ error: 'expire_date must be a valid date' });
            return;
        }

        const user = await getUserById(created_by);
        if (!user) {
            res.status(404).json({ error: `User with id ${created_by} not found` });
            return;
        }

        const status = await getOrderStatusById(status_id)
        if (!status) {
            res.status(404).json({ error: `Oredr status with id ${status_id} not found` });
            return;
        }

        const order = await createOrder(
            name.trim(),
            created_by,
            status_id,
            start_date,
            expire_date
        );
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create order' });
    }
};

export const editOrder = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        if (isNaN(id)) {
            res.status(400).json({ error: 'id must be an integer' });
            return;
        }

        const { name, status_id, start_date, expire_date } = req.body;

        if (!name && !status_id && !start_date && !expire_date) {
            res.status(400).json({ error: 'At least one field is required' });
            return;
        }

        if (name !== undefined && !isNonEmptyString(name)) {
            res.status(400).json({ error: 'name must be a non-empty string' });
            return;
        }

        if (status_id !== undefined && !isNatural(status_id)) {
            res.status(400).json({ error: 'status_id must be a positive integer' });
            return;
        }

        if (start_date !== undefined && !isValidDate(start_date)) {
            res.status(400).json({ error: 'start_date must be a valid date' });
            return;
        }

        if (expire_date !== undefined && !isValidDate(expire_date)) {
            res.status(400).json({ error: 'expire_date must be a valid date' });
            return;
        }

        if (status_id !== undefined) {
            const status = await getOrderStatusById(status_id);
            if (!status) {
                res.status(404).json({ error: `Order status with id ${status_id} not found` });
                return;
            }
        }

        const fields: Partial<{
            name: string,
            status_id: number,
            start_date: string,
            expire_date: string
        }> = {};

        if (name !== undefined) fields.name = name.trim();
        if (status_id !== undefined) fields.status_id = status_id;
        if (start_date !== undefined) fields.start_date = start_date;
        if (expire_date !== undefined) fields.expire_date = expire_date;

        const order = await updateOrder(id, fields);
        if (!order) {
            res.status(404).json({ error: `Order with id ${id} not found` });
            return;
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update order' });
    }
};

export const removeOrder = async (req: Request, res: Response) => {
    try {
        const id = idParser(req.params.id as string);
        if (id === null) {
            res.status(400).json({ error: 'id must be an integer' });
            return;
        }

        const existing = await getOrderById(id);
        if (!existing) {
            res.status(404).json({ error: `Order with id ${id} not found` });
            return;
        }

        await deleteOrder(id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete order' });
    }
};
