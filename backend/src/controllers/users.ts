import { getRoleById } from '@dal/roles';
import {
    createUser,
    deleteUser,
    getAllUsers,
    getUserById,
    updateUser,
} from '@dal/users';
import { CreateUserInput, UpdateUserInput } from '@models/user';
import { idParser } from '@utils/parsers';
import {
    isNatural,
    isNonEmptyString,
    isValidIsraeliPhone,
} from '@utils/validators';
import { Request, Response } from 'express';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = idParser(req.params.id as string);
        if (id === null) {
            res.status(400).json({ error: 'id must be an integer' });
            return;
        }

        const user = await getUserById(id);
        if (!user) {
            res.status(404).json({ error: `User with id ${id} not found` });
            return;
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};

export const addUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, phone_number, role_id } = req.body;

        if (!name || !phone_number || !role_id) {
            res.status(400).json({
                error: 'name, phone_number and role_id are required',
            });
            return;
        }

        if (!isNonEmptyString(name)) {
            res.status(400).json({ error: 'name must be a non-empty string' });
            return;
        }

        if (!isValidIsraeliPhone(phone_number)) {
            res.status(400).json({
                error: 'phone_number must be a valid Israeli phone number',
            });
            return;
        }

        if (!isNatural(role_id)) {
            res.status(400).json({
                error: 'role_id must be a positive integer',
            });
            return;
        }

        const role = await getRoleById(role_id);
        if (!role) {
            res.status(404).json({
                error: `Role with id ${role_id} not found`,
            });
            return;
        }

        const input: CreateUserInput = {
            name: name.trim(),
            phone_number: phone_number.trim(),
            role_id,
        };
        const user = await createUser(input);
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
};

export const editUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = idParser(req.params.id as string);
        if (id === null) {
            res.status(400).json({ error: 'id must be an integer' });
            return;
        }

        const { name, phone_number, role_id } = req.body;

        if (!name && !phone_number && !role_id) {
            res.status(400).json({ error: 'at least one field is required' });
            return;
        }

        if (name !== undefined && !isNonEmptyString(name)) {
            res.status(400).json({ error: 'name must be a non-empty string' });
            return;
        }

        if (phone_number !== undefined && !isValidIsraeliPhone(phone_number)) {
            res.status(400).json({
                error: 'phone_number must be a valid Israeli phone number',
            });
            return;
        }

        if (role_id !== undefined && !isNatural(role_id)) {
            res.status(400).json({
                error: 'role_id must be a positive integer',
            });
            return;
        }

        if (role_id !== undefined) {
            const role = await getRoleById(role_id);
            if (!role) {
                res.status(404).json({
                    error: `Role with id ${role_id} not found`,
                });
                return;
            }
        }

        const fields: UpdateUserInput = {};
        if (name !== undefined) fields.name = name.trim();
        if (phone_number !== undefined) fields.phone_number = phone_number.trim();
        if (role_id !== undefined) fields.role_id = role_id;

        const user = await updateUser(id, fields);
        if (!user) {
            res.status(404).json({ error: `User with id ${id} not found` });
            return;
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user' });
    }
};

export const removeUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = idParser(req.params.id as string);
        if (id === null) {
            res.status(400).json({ error: 'id must be an integer' });
            return;
        }

        const existing = await getUserById(id);
        if (!existing) {
            res.status(404).json({ error: `User with id ${id} not found` });
            return;
        }

        await deleteUser(id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
};