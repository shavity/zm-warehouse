import { Request, Response } from 'express';
import { getUser, getUsers, addUser, editUser, removeUser } from '../../../src/controllers/users';
import * as usersDal from '../../../src/dal/users';
import * as rolesDal from '../../../src/dal/roles';

jest.mock('../../../src/dal/users');
jest.mock('../../../src/dal/roles');

const mockRequest = (body = {}, params = {}) => ({ body, params } as Request);
const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

const fakeUser = { id: 1, name: 'Yair', phone_number: '0501234567', role_id: 1, role_name: 'admin' };

describe('Users Controller - Unit Tests', () => {

  beforeEach(() => jest.clearAllMocks());

  describe('getUsers', () => {
    it('should return all users', async () => {
      (usersDal.getAllUsers as jest.Mock).mockResolvedValue([fakeUser]);
      const req = mockRequest();
      const res = mockResponse();
      await getUsers(req, res);
      expect(res.json).toHaveBeenCalledWith([fakeUser]);
    });

    it('should return 500 if database fails', async () => {
      (usersDal.getAllUsers as jest.Mock).mockRejectedValue(new Error('DB error'));
      const req = mockRequest();
      const res = mockResponse();
      await getUsers(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getUser', () => {
    it('should return a user by id', async () => {
      (usersDal.getUserById as jest.Mock).mockResolvedValue(fakeUser);
      const req = mockRequest({}, { id: '1' });
      const res = mockResponse();
      await getUser(req, res);
      expect(res.json).toHaveBeenCalledWith(fakeUser);
    });

    it('should return 400 if id is not an integer', async () => {
      const req = mockRequest({}, { id: 'abc' });
      const res = mockResponse();
      await getUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if user not found', async () => {
      (usersDal.getUserById as jest.Mock).mockResolvedValue(undefined);
      const req = mockRequest({}, { id: '999' });
      const res = mockResponse();
      await getUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 if database fails', async () => {
      (usersDal.getUserById as jest.Mock).mockRejectedValue(new Error('DB error'));
      const req = mockRequest({}, { id: '1' });
      const res = mockResponse();
      await getUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('addUser', () => {
    it('should return 201 if user created successfully', async () => {
      (rolesDal.getAllRoles as jest.Mock).mockResolvedValue([{ id: 1, name: 'admin' }]);
      (usersDal.createUser as jest.Mock).mockResolvedValue(fakeUser);
      const req = mockRequest({ name: 'Yair', phone_number: '0501234567', role_id: 1 });
      const res = mockResponse();
      await addUser(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(fakeUser);
    });

    it('should return 400 if name is missing', async () => {
      const req = mockRequest({ phone_number: '0501234567', role_id: 1 });
      const res = mockResponse();
      await addUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if phone_number is missing', async () => {
      const req = mockRequest({ name: 'Yair', role_id: 1 });
      const res = mockResponse();
      await addUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if role_id is missing', async () => {
      const req = mockRequest({ name: 'Yair', phone_number: '0501234567' });
      const res = mockResponse();
      await addUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if name is not a string', async () => {
      const req = mockRequest({ name: 123, phone_number: '0501234567', role_id: 1 });
      const res = mockResponse();
      await addUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if phone_number is invalid', async () => {
      const req = mockRequest({ name: 'Yair', phone_number: '12345', role_id: 1 });
      const res = mockResponse();
      await addUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if role_id is not a positive integer', async () => {
      const req = mockRequest({ name: 'Yair', phone_number: '0501234567', role_id: -1 });
      const res = mockResponse();
      await addUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if role not found', async () => {
      (rolesDal.getAllRoles as jest.Mock).mockResolvedValue([]);
      const req = mockRequest({ name: 'Yair', phone_number: '0501234567', role_id: 999 });
      const res = mockResponse();
      await addUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 if database fails', async () => {
      (rolesDal.getAllRoles as jest.Mock).mockResolvedValue({ id: 1, name: 'admin' });
      (usersDal.createUser as jest.Mock).mockRejectedValue(new Error('DB error'));
      const req = mockRequest({ name: 'Yair', phone_number: '0501234567', role_id: 1 });
      const res = mockResponse();
      await addUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('editUser', () => {
    it('should return updated user', async () => {
      (rolesDal.getAllRoles as jest.Mock).mockResolvedValue({ id: 1, name: 'admin' });
      (usersDal.updateUser as jest.Mock).mockResolvedValue({ ...fakeUser, name: 'Yair Updated' });
      const req = mockRequest({ name: 'Yair Updated' }, { id: '1' });
      const res = mockResponse();
      await editUser(req, res);
      expect(res.json).toHaveBeenCalledWith({ ...fakeUser, name: 'Yair Updated' });
    });

    it('should return 400 if id is not an integer', async () => {
      const req = mockRequest({ name: 'Yair' }, { id: 'abc' });
      const res = mockResponse();
      await editUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if no fields provided', async () => {
      const req = mockRequest({}, { id: '1' });
      const res = mockResponse();
      await editUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if name is empty string', async () => {
      const req = mockRequest({ name: '   ' }, { id: '1' });
      const res = mockResponse();
      await editUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if phone_number is invalid', async () => {
      const req = mockRequest({ phone_number: '12345' }, { id: '1' });
      const res = mockResponse();
      await editUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if role not found', async () => {
      (rolesDal.getAllRoles as jest.Mock).mockResolvedValue([{ id: 1, name: 'admin' }]);
      const req = mockRequest({ role_id: 999 }, { id: '1' });
      const res = mockResponse();
      await editUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 404 if user not found', async () => {
      (usersDal.updateUser as jest.Mock).mockResolvedValue(undefined);
      const req = mockRequest({ name: 'Yair' }, { id: '999' });
      const res = mockResponse();
      await editUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 if database fails', async () => {
      (usersDal.updateUser as jest.Mock).mockRejectedValue(new Error('DB error'));
      const req = mockRequest({ name: 'Yair' }, { id: '1' });
      const res = mockResponse();
      await editUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('removeUser', () => {
    it('should return 204 if user deleted successfully', async () => {
      (usersDal.getUserById as jest.Mock).mockResolvedValue(fakeUser);
      (usersDal.deleteUser as jest.Mock).mockResolvedValue(fakeUser);
      const req = mockRequest({}, { id: '1' });
      const res = mockResponse();
      await removeUser(req, res);
      expect(res.status).toHaveBeenCalledWith(204);
    });

    it('should return 400 if id is not an integer', async () => {
      const req = mockRequest({}, { id: 'abc' });
      const res = mockResponse();
      await removeUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if user not found', async () => {
      (usersDal.getUserById as jest.Mock).mockResolvedValue(undefined);
      const req = mockRequest({}, { id: '999' });
      const res = mockResponse();
      await removeUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 if database fails', async () => {
      (usersDal.getUserById as jest.Mock).mockResolvedValue(fakeUser);
      (usersDal.deleteUser as jest.Mock).mockRejectedValue(new Error('DB error'));
      const req = mockRequest({}, { id: '1' });
      const res = mockResponse();
      await removeUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});