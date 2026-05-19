import { Request, Response } from 'express';
import { addRoom, getRooms } from '../../../src/controllers/rooms';
import * as roomsDal from '../../../src/dal/rooms';

jest.mock('../../../src/dal/rooms');

const mockRequest = (body = {}) => ({ body }) as Request;
const mockResponse = () => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Rooms Controller - Unit Tests', () => {
    beforeEach(() => jest.clearAllMocks());

    describe('getRooms', () => {
        it('should return all rooms', async () => {
            const fakeRooms = [{ id: 1, name: 'Kitchen' }];
            (roomsDal.getAllRooms as jest.Mock).mockResolvedValue(fakeRooms);
            const req = mockRequest();
            const res = mockResponse();
            await getRooms(req, res);
            expect(res.json).toHaveBeenCalledWith(fakeRooms);
        });

        it('should return 500 if database fails', async () => {
            (roomsDal.getAllRooms as jest.Mock).mockRejectedValue(
                new Error('DB error')
            );
            const req = mockRequest();
            const res = mockResponse();
            await getRooms(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('addRoom', () => {
        it('should return 400 if id is missing', async () => {
            const req = mockRequest({ name: 'Kitchen' });
            const res = mockResponse();
            await addRoom(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if name is missing', async () => {
            const req = mockRequest({ id: 1 });
            const res = mockResponse();
            await addRoom(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if id is not an integer', async () => {
            const req = mockRequest({ id: 'abc', name: 'Kitchen' });
            const res = mockResponse();
            await addRoom(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if name is empty string', async () => {
            const req = mockRequest({ id: 1, name: '   ' });
            const res = mockResponse();
            await addRoom(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 409 if room already exists', async () => {
            (roomsDal.upsertRoom as jest.Mock).mockResolvedValue({
                id: 1,
                name: 'Kitchen',
                inserted: false,
            });
            const req = mockRequest({ id: 1, name: 'Kitchen' });
            const res = mockResponse();
            await addRoom(req, res);
            expect(res.status).toHaveBeenCalledWith(409);
        });

        it('should return 201 if room created successfully', async () => {
            (roomsDal.upsertRoom as jest.Mock).mockResolvedValue({
                id: 1,
                name: 'Kitchen',
                inserted: true,
            });
            const req = mockRequest({ id: 1, name: 'Kitchen' });
            const res = mockResponse();
            await addRoom(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });
});
