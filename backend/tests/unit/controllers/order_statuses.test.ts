import { Request, Response } from 'express';
import { getOrderStatuses } from '../../../src/controllers/order_statuses';
import * as orderStatusesDal from '../../../src/dal/order_statuses';

jest.mock('../../../src/dal/order_statuses');

const mockRequest = (body = {}) => ({ body }) as Request;
const mockResponse = () => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Order Statuses Controller - Unit Tests', () => {
    beforeEach(() => jest.clearAllMocks());

    describe('getOrderStatuses', () => {
        it('should return all order statuses', async () => {
            const fakeOrderStatuses = [{ name: 'draft' }];
            (
                orderStatusesDal.getAllOrderStatuses as jest.Mock
            ).mockResolvedValue(fakeOrderStatuses);
            const req = mockRequest();
            const res = mockResponse();
            await getOrderStatuses(req, res);
            expect(res.json).toHaveBeenCalledWith(fakeOrderStatuses);
        });

        it('should return 500 if database fails', async () => {
            (
                orderStatusesDal.getAllOrderStatuses as jest.Mock
            ).mockRejectedValue(new Error('DB error'));
            const req = mockRequest();
            const res = mockResponse();
            await getOrderStatuses(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
