import { Request, Response } from 'express';
import {
    getOrderItemsByOrderId,
    getOrderItemByIds,
    createOrderItem,
    updateOrderItem,
    deleteOrderItem
} from '@dal/order_items';
import { getOrderById } from '@dal/orders';
import { getProductById } from '@dal/products';
import { getUserById } from '@dal/users';
import { isNatural, isNonNegativeInteger, isNonEmptyString } from '@utils/validators';
import { idParser } from '@utils/parsers';

export const getOrderItems = async (req: Request, res: Response) => {
    try {
        const order_id = idParser(req.params.order_id as string);
        if (order_id === null) {
            res.status(400).json({ error: 'order_id must be an integer' });
            return;
        }

        const order = await getOrderById(order_id);
        if (!order) {
            res.status(404).json({ error: `Order with id ${order_id} not found` });
            return;
        }

        const items = await getOrderItemsByOrderId(order_id);
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch order items' });
    }
};

export const addOrderItem = async (req: Request, res: Response) => {
    try {
        const order_id = idParser(req.params.order_id as string);
        if (order_id === null) {
            res.status(400).json({ error: 'order_id must be an integer' });
            return;
        }

        const { product_id, amount, user_id } = req.body;

        if (!product_id || !amount) {
            res.status(400).json({ error: 'product_id and amount are required' });
            return;
        }

        if (!isNatural(product_id)) {
            res.status(400).json({ error: 'product_id must be a positive integer' });
            return;
        }

        if (!isNatural(amount)) {
            res.status(400).json({ error: 'amount must be a positive integer' });
            return;
        }

        if (user_id !== undefined && !isNatural(user_id)) {
            res.status(400).json({ error: 'user_id must be a positive integer' });
            return;
        }

        const order = await getOrderById(order_id);
        if (!order) {
            res.status(404).json({ error: `Order with id ${order_id} not found` });
            return;
        }

        const product = await getProductById(product_id);
        if (!product) {
            res.status(404).json({ error: `Product with id ${product_id} not found` });
            return;
        }

        if (user_id !== undefined) {
            const user = await getUserById(user_id);
            if (!user) {
                res.status(404).json({ error: `User with id ${user_id} not found` });
                return;
            }
        }

        const existing = await getOrderItemByIds(order_id, product_id);
        if (existing) {
            res.status(409).json({ error: `Product with id ${product_id} already exists in order ${order_id}` });
            return;
        }

        const item = await createOrderItem(order_id, product_id, amount, user_id);
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create order item' });
    }
};

export const editOrderItem = async (req: Request, res: Response) => {
    try {
        const order_id = idParser(req.params.order_id as string);
        const product_id = idParser(req.params.product_id as string);

        if (order_id === null) {
            res.status(400).json({ error: 'order_id must be an integer' });
            return;
        }

        if (product_id === null) {
            res.status(400).json({ error: 'product_id must be an integer' });
            return;
        }

        const { amount, actual_amount, returned_amount, comment, user_id, returned_by } = req.body;

        if (
            amount === undefined &&
            actual_amount === undefined &&
            returned_amount === undefined &&
            comment === undefined &&
            user_id === undefined &&
            returned_by === undefined
        ) {
            res.status(400).json({ error: 'At least one field is required' });
            return;
        }

        if (amount !== undefined && !isNatural(amount)) {
            res.status(400).json({ error: 'amount must be a positive integer' });
            return;
        }

        if (actual_amount !== undefined && !isNonNegativeInteger(actual_amount)) {
            res.status(400).json({ error: 'actual_amount must be a non-negative integer' });
            return;
        }

        if (returned_amount !== undefined && !isNonNegativeInteger(returned_amount)) {
            res.status(400).json({ error: 'returned_amount must be a non-negative integer' });
            return;
        }

        if (comment !== undefined && !isNonEmptyString(comment)) {
            res.status(400).json({ error: 'comment must be a non-empty string' });
            return;
        }

        if (user_id !== undefined && !isNatural(user_id)) {
            res.status(400).json({ error: 'user_id must be a positive integer' });
            return;
        }

        if (returned_by !== undefined && !isNatural(returned_by)) {
            res.status(400).json({ error: 'returned_by must be a positive integer' });
            return;
        }

        if (user_id !== undefined) {
            const user = await getUserById(user_id);
            if (!user) {
                res.status(404).json({ error: `User with id ${user_id} not found` });
                return;
            }
        }

        if (returned_by !== undefined) {
            const returner = await getUserById(returned_by);
            if (!returner) {
                res.status(404).json({ error: `User with id ${returned_by} not found` });
                return;
            }
        }

        const existing = await getOrderItemByIds(order_id, product_id);
        if (!existing) {
            res.status(404).json({ error: `Order item not found` });
            return;
        }

        const fields: Partial<{
            amount: number,
            actual_amount: number,
            returned_amount: number,
            comment: string,
            user_id: number,
            returned_by: number
        }> = {};

        if (amount !== undefined) fields.amount = amount;
        if (actual_amount !== undefined) fields.actual_amount = actual_amount;
        if (returned_amount !== undefined) fields.returned_amount = returned_amount;
        if (comment !== undefined) fields.comment = comment.trim();
        if (user_id !== undefined) fields.user_id = user_id;
        if (returned_by !== undefined) fields.returned_by = returned_by;

        const item = await updateOrderItem(order_id, product_id, fields);
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update order item' });
    }
};

export const removeOrderItem = async (req: Request, res: Response) => {
    try {
        const order_id = idParser(req.params.order_id as string);
        const product_id = idParser(req.params.product_id as string);

        if (order_id === null) {
            res.status(400).json({ error: 'order_id must be an integer' });
            return;
        }

        if (product_id === null) {
            res.status(400).json({ error: 'product_id must be an integer' });
            return;
        }

        const existing = await getOrderItemByIds(order_id, product_id);
        if (!existing) {
            res.status(404).json({ error: `Order item not found` });
            return;
        }

        await deleteOrderItem(order_id, product_id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete order item' });
    }
};
