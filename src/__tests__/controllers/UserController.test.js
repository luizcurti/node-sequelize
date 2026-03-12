const UserController = require('../../controllers/UserController');
const User = require('../../models/User');

jest.mock('../../models/User');

describe('UserController', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
    };
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('index', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: 1, name: 'User 1', email: 'user1@example.com' },
        { id: 2, name: 'User 2', email: 'user2@example.com' },
      ];

      User.findAll.mockResolvedValue(mockUsers);

      await UserController.index(req, res);

      expect(User.findAll).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should return empty array when no users exist', async () => {
      User.findAll.mockResolvedValue([]);

      await UserController.index(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should return 500 on database error', async () => {
      User.findAll.mockRejectedValue(new Error('DB error'));

      await UserController.index(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('store', () => {
    it('should create a new user and return 201', async () => {
      const userData = { name: 'New User', email: 'newuser@example.com' };
      const mockUser = { id: 1, ...userData };

      req.body = userData;
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUser);

      await UserController.store(req, res);

      expect(User.create).toHaveBeenCalledWith({ name: 'New User', email: 'newuser@example.com' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 400 when name is missing', async () => {
      req.body = { email: 'test@example.com' };

      await UserController.store(req, res);

      expect(User.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Name and email are required' });
    });

    it('should return 400 when email is missing', async () => {
      req.body = { name: 'Test User' };

      await UserController.store(req, res);

      expect(User.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 409 when email is already in use', async () => {
      req.body = { name: 'Test', email: 'taken@example.com' };
      User.findOne.mockResolvedValue({ id: 99, email: 'taken@example.com' });

      await UserController.store(req, res);

      expect(User.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email already in use' });
    });

    it('should return 500 on database error', async () => {
      req.body = { name: 'Test', email: 'test@example.com' };
      User.findOne.mockRejectedValue(new Error('DB error'));

      await UserController.store(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('update', () => {
    it('should update an existing user', async () => {
      const mockUser = {
        id: 1,
        name: 'Old Name',
        email: 'old@example.com',
        update: jest.fn().mockResolvedValue(true),
      };
      req.params.id = '1';
      req.body = { name: 'New Name', email: 'old@example.com' };
      User.findByPk.mockResolvedValue(mockUser);
      User.findOne.mockResolvedValue(null);

      await UserController.update(req, res);

      expect(mockUser.update).toHaveBeenCalledWith({ name: 'New Name', email: 'old@example.com' });
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 when user not found', async () => {
      req.params.id = '999';
      req.body = { name: 'Name' };
      User.findByPk.mockResolvedValue(null);

      await UserController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should update email when new email is not taken', async () => {
      const mockUser = {
        id: 1,
        name: 'Alice',
        email: 'old@example.com',
        update: jest.fn().mockResolvedValue(true),
      };
      req.params.id = '1';
      req.body = { name: 'Alice', email: 'new@example.com' };
      User.findByPk.mockResolvedValue(mockUser);
      User.findOne.mockResolvedValue(null);

      await UserController.update(req, res);

      expect(User.findOne).toHaveBeenCalled();
      expect(mockUser.update).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 409 when new email is already taken', async () => {
      const mockUser = { id: 1, email: 'mine@example.com', update: jest.fn() };
      req.params.id = '1';
      req.body = { email: 'taken@example.com' };
      User.findByPk.mockResolvedValue(mockUser);
      User.findOne.mockResolvedValue({ id: 2, email: 'taken@example.com' });

      await UserController.update(req, res);

      expect(mockUser.update).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(409);
    });

    it('should return 500 on database error', async () => {
      req.params.id = '1';
      req.body = { name: 'Test' };
      User.findByPk.mockRejectedValue(new Error('DB error'));

      await UserController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('destroy', () => {
    it('should delete user and return 204', async () => {
      const mockUser = { id: 1, destroy: jest.fn().mockResolvedValue(true) };
      req.params.id = '1';
      User.findByPk.mockResolvedValue(mockUser);

      await UserController.destroy(req, res);

      expect(mockUser.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should return 404 when user not found', async () => {
      req.params.id = '999';
      User.findByPk.mockResolvedValue(null);

      await UserController.destroy(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return 500 on database error', async () => {
      req.params.id = '1';
      User.findByPk.mockRejectedValue(new Error('DB error'));

      await UserController.destroy(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
