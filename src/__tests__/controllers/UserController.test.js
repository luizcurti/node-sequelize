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

      expect(User.findAll).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      User.findAll.mockRejectedValue(error);

      await expect(UserController.index(req, res)).rejects.toThrow('Database error');
      expect(User.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('store', () => {
    it('should create a new user', async () => {
      const userData = {
        name: 'New User',
        email: 'newuser@example.com',
      };
      const mockUser = { id: 1, ...userData };

      req.body = userData;
      User.create.mockResolvedValue(mockUser);

      await UserController.store(req, res);

      expect(User.create).toHaveBeenCalledTimes(1);
      expect(User.create).toHaveBeenCalledWith({ name: 'New User', email: 'newuser@example.com' });
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should create user with only name', async () => {
      const userData = {
        name: 'Only Name',
        email: undefined,
      };
      const mockUser = { id: 1, name: 'Only Name', email: null };

      req.body = userData;
      User.create.mockResolvedValue(mockUser);

      await UserController.store(req, res);

      expect(User.create).toHaveBeenCalledWith({ name: 'Only Name', email: undefined });
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should create user with only email', async () => {
      const userData = {
        name: undefined,
        email: 'only@email.com',
      };
      const mockUser = { id: 1, name: null, email: 'only@email.com' };

      req.body = userData;
      User.create.mockResolvedValue(mockUser);

      await UserController.store(req, res);

      expect(User.create).toHaveBeenCalledWith({ name: undefined, email: 'only@email.com' });
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should handle database errors on create', async () => {
      const error = new Error('Database error');
      req.body = { name: 'Test', email: 'test@example.com' };
      User.create.mockRejectedValue(error);

      await expect(UserController.store(req, res)).rejects.toThrow('Database error');
      expect(User.create).toHaveBeenCalledTimes(1);
    });

    it('should handle validation errors', async () => {
      const error = new Error('Validation error');
      req.body = { name: '', email: 'invalid-email' };
      User.create.mockRejectedValue(error);

      await expect(UserController.store(req, res)).rejects.toThrow('Validation error');
    });
  });
});
