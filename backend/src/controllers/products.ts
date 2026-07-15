import { Request, Response } from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from '@dal/products';
import { getRoomById } from '@dal/rooms';
import { getCategoryById } from '@dal/categories';
import { isNonEmptyString, isNatural, isNonNegativeInteger } from '@utils/validators';
import { idParser } from '@utils/parsers';

export const getProducts = async (req: Request, res: Response) => {
    try {
        const products = await getAllProducts();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

export const getProduct = async (req: Request, res: Response) => {
    try {
        const id = idParser(req.params.id as string);
        if (id === null) {
            res.status(400).json({ error: 'id must be an integer' });
            return;
        }

        const product = await getProductById(id);
        if (!product) {
            res.status(404).json({ error: `Product with id ${id} not found` });
            return;
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
};

export const addProduct = async (req: Request, res: Response) => {
    try {
        const { name, room_id, category_id, in_stock, minimum_in_stock, is_expendable, picture_url } = req.body;

        if (!name || !room_id || !category_id || in_stock === undefined || minimum_in_stock === undefined || is_expendable === undefined) {
            res.status(400).json({ error: 'name, room_id, category_id, in_stock, minimum_in_stock and is_expendable are required' });
            return;
        }

        if (!isNonEmptyString(name)) {
            res.status(400).json({ error: 'name must be a non-empty string' });
            return;
        }

        if (!isNatural(room_id)) {
            res.status(400).json({ error: 'room_id must be a positive integer' });
            return;
        }

        if (!isNatural(category_id)) {
            res.status(400).json({ error: 'category_id must be a positive integer' });
            return;
        }

        if (!isNonNegativeInteger(in_stock)) {
            res.status(400).json({ error: 'in_stock must be a non-negative integer' });
            return;
        }

        if (!isNonNegativeInteger(minimum_in_stock)) {
            res.status(400).json({ error: 'minimum_in_stock must be a non-negative integer' });
            return;
        }

        if (typeof is_expendable !== 'boolean') {
            res.status(400).json({ error: 'is_expendable must be a boolean' });
            return;
        }

        if (picture_url !== undefined && !isNonEmptyString(picture_url)) {
            res.status(400).json({ error: 'picture_url must be a non-empty string' });
            return;
        }

        const room = await getRoomById(room_id);
        if (!room) {
            res.status(404).json({ error: `Room with id ${room_id} not found` });
            return;
        }

        const category = await getCategoryById(category_id);
        if (!category) {
            res.status(404).json({ error: `Category with id ${category_id} not found` });
            return;
        }

        const product = await createProduct(
            name.trim(),
            room_id,
            category_id,
            in_stock,
            minimum_in_stock,
            is_expendable,
            picture_url?.trim()
        );
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create product' });
    }
};

export const editProduct = async (req: Request, res: Response) => {
    try {
        const id = idParser(req.params.id as string);
        if (id === null) {
            res.status(400).json({ error: 'id must be an integer' });
            return;
        }

        const { name, room_id, category_id, in_stock, minimum_in_stock, is_expendable, picture_url } = req.body;

        if (!name && !room_id && !category_id && in_stock === undefined && minimum_in_stock === undefined && is_expendable === undefined && !picture_url) {
            res.status(400).json({ error: 'At least one field is required' });
            return;
        }

        if (name !== undefined && !isNonEmptyString(name)) {
            res.status(400).json({ error: 'name must be a non-empty string' });
            return;
        }

        if (room_id !== undefined && !isNatural(room_id)) {
            res.status(400).json({ error: 'room_id must be a positive integer' });
            return;
        }

        if (category_id !== undefined && !isNatural(category_id)) {
            res.status(400).json({ error: 'category_id must be a positive integer' });
            return;
        }

        if (in_stock !== undefined && !isNonNegativeInteger(in_stock)) {
            res.status(400).json({ error: 'in_stock must be a non-negative integer' });
            return;
        }

        if (minimum_in_stock !== undefined && !isNonNegativeInteger(minimum_in_stock)) {
            res.status(400).json({ error: 'minimum_in_stock must be a non-negative integer' });
            return;
        }

        if (is_expendable !== undefined && typeof is_expendable !== 'boolean') {
            res.status(400).json({ error: 'is_expendable must be a boolean' });
            return;
        }

        if (picture_url !== undefined && !isNonEmptyString(picture_url)) {
            res.status(400).json({ error: 'picture_url must be a non-empty string' });
            return;
        }

        if (room_id !== undefined) {
            const room = await getRoomById(room_id);
            if (!room) {
                res.status(404).json({ error: `Room with id ${room_id} not found` });
                return;
            }
        }

        if (category_id !== undefined) {
            const category = await getCategoryById(category_id);
            if (!category) {
                res.status(404).json({ error: `Category with id ${category_id} not found` });
                return;
            }
        }

        const fields: Partial<{
            name: string,
            room_id: number,
            category_id: number,
            in_stock: number,
            minimum_in_stock: number,
            is_expendable: boolean,
            picture_url: string
        }> = {};

        if (name !== undefined) fields.name = name.trim();
        if (room_id !== undefined) fields.room_id = room_id;
        if (category_id !== undefined) fields.category_id = category_id;
        if (in_stock !== undefined) fields.in_stock = in_stock;
        if (minimum_in_stock !== undefined) fields.minimum_in_stock = minimum_in_stock;
        if (is_expendable !== undefined) fields.is_expendable = is_expendable;
        if (picture_url !== undefined) fields.picture_url = picture_url.trim();

        const product = await updateProduct(id, fields);
        if (!product) {
            res.status(404).json({ error: `Product with id ${id} not found` });
            return;
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update product' });
    }
};

export const removeProduct = async (req: Request, res: Response) => {
    try {
        const id = idParser(req.params.id as string);
        if (id === null) {
            res.status(400).json({ error: 'id must be an integer' });
            return;
        }

        const existing = await getProductById(id);
        if (!existing) {
            res.status(404).json({ error: `Product with id ${id} not found` });
            return;
        }

        await deleteProduct(id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
};
