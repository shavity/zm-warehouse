import { Request, Response } from 'express';
import { addCategory, getCategories } from '../../../src/controllers/categories';
import * as categoriesDal from '../../../src/dal/categories';

jest.mock('../../../src/dal/categories');

const mockRequest = (body = {}) => ({ body } as Request);
const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Categories Controller - Unit Tests', () => {

  beforeEach(() => jest.clearAllMocks());

  describe('getCategories', () => {
    it('should return all categories', async () => {
      const fakeCategories = [{ id: 1, name: 'Kitchen' }];
      (categoriesDal.getAllCategories as jest.Mock).mockResolvedValue(fakeCategories);
      const req = mockRequest();
      const res = mockResponse();
      await getCategories(req, res);
      expect(res.json).toHaveBeenCalledWith(fakeCategories);
    });

    it('should return 500 if database fails', async () => {
      (categoriesDal.getAllCategories as jest.Mock).mockRejectedValue(new Error('DB error'));
      const req = mockRequest();
      const res = mockResponse();
      await getCategories(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('addCategory', () => {
    it('should return 400 if name is missing', async () => {
      const req = mockRequest({ });
      const res = mockResponse();
      await addCategory(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if name is not a string', async () => {
      const req = mockRequest({ name: 123 });
      const res = mockResponse();
      await addCategory(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if name is empty string', async () => {
      const req = mockRequest({ name: '   ' });
      const res = mockResponse();
      await addCategory(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 409 if category already exists', async () => {
      (categoriesDal.upsertCategory as jest.Mock).mockResolvedValue({ id: 1, name: 'Kitchen', inserted: false });
      const req = mockRequest({ name: 'Kitchen' });
      const res = mockResponse();
      await addCategory(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
    });

    it('should return 201 if category created successfully', async () => {
      (categoriesDal.upsertCategory as jest.Mock).mockResolvedValue({ id: 1, name: 'Kitchen', inserted: true });
      const req = mockRequest({ name: 'Kitchen' });
      const res = mockResponse();
      await addCategory(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });
});