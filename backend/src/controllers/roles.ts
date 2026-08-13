import { getAllRoles } from '@dal/roles';
import { Request, Response } from 'express';

export const getRoles = async (req: Request, res: Response) => {
    try {
        const roles = await getAllRoles();
        res.json(roles);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch roles' });
    }
};
