import { getAllCategories, upsertCategory } from '@dal/categories';
import { isNonEmptyString } from '@utils/validators';
import { Request, Response } from 'express';

export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await getAllCategories();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};

export const addCategory = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;

        if (!name || !isNonEmptyString(name)) {
            res.status(400).json({ error: 'name must be a non-empty string' });
            return;
        }

        const category = await upsertCategory(name.trim());
        if (!category.inserted) {
            res.status(409).json({
                error: `Category with name ${name} already exists`,
            });
            return;
        }

        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create category' });
    }
};
