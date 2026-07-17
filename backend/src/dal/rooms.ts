import db from './database';
import { Room } from '@models/room';

export const getAllRooms = async (): Promise<Room[]> => {
    const result = await db.query('SELECT * FROM rooms ORDER BY id');
    return result.rows;
};

export const getRoomById = async (id: number): Promise<Room | undefined> => {
    const result = await db.query(
        'SELECT * FROM rooms WHERE id = $1',
        [id]
    );
    return result.rows[0];
};

export const createRoom = async (id: number, name: string): Promise<Room> => {
    const result = await db.query(
        'INSERT INTO rooms (id, name) VALUES ($1, $2) RETURNING *',
        [id, name]
    );
    return result.rows[0];
};

export const upsertRoom = async (id: number, name: string): Promise<Room | undefined> => {
    const result = await db.query(`
        INSERT INTO rooms (id, name) VALUES ($1, $2)
        ON CONFLICT (id) DO UPDATE SET id = EXCLUDED.id
        RETURNING *, (xmax = 0) AS inserted`,
        [id, name]
    );
    return result.rows[0];
};
