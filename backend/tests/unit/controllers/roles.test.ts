import { Request, Response } from 'express';
import { getRoles } from '../../../src/controllers/roles';
import * as rolesDal from '../../../src/dal/roles';

jest.mock('../../../src/dal/roles');

const mockRequest = (body = {}) => ({ body }) as Request;
const mockResponse = () => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Roles Controller - Unit Tests', () => {
    beforeEach(() => jest.clearAllMocks());

    describe('getRoles', () => {
        it('should return all roles', async () => {
            const fakeRoles = [{ name: 'admin' }];
            (rolesDal.getAllRoles as jest.Mock).mockResolvedValue(fakeRoles);
            const req = mockRequest();
            const res = mockResponse();
            await getRoles(req, res);
            expect(res.json).toHaveBeenCalledWith(fakeRoles);
        });

        it('should return 500 if database fails', async () => {
            (rolesDal.getAllRoles as jest.Mock).mockRejectedValue(
                new Error('DB error')
            );
            const req = mockRequest();
            const res = mockResponse();
            await getRoles(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
