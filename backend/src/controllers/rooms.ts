import { Request, Response } from 'express';
import { getAllRooms, upsertRoom } from '@dal/rooms';
import { isNonEmptyString, isNatural } from '@utils/validatiors';

export const getRooms = async (req: Request, res: Response) => {
  try {
    const rooms = await getAllRooms();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};

export const addRoom = async (req: Request, res: Response) => {
  try {
    const { id, name } = req.body;

    if (!id || !name) {
      res.status(400).json({ error: 'id and name are required' });
      return;
    }

    if (!isNatural(id)) {
      res.status(400).json({ error: 'id must be an integer' });
      return;
    }

    if (!isNonEmptyString(name)) {
      res.status(400).json({ error: 'name must be a non-empty string' });
      return;
    }

    const room = await upsertRoom(id, name.trim());
    if (!room.inserted) {
      res.status(409).json({ error: `Room with id ${id} already exists` });
      return;
    }

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create room' });
  }
};