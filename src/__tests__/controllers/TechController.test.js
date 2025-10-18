const TechController = require('../../controllers/TechController');
const User = require('../../models/User');
const Tech = require('../../models/Tech');

jest.mock('../../models/User');
jest.mock('../../models/Tech');

describe('TechController', () => {
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
    it('should return all techs for a user', async () => {
      const mockTechs = [
        { name: 'React' },
        { name: 'Node.js' },
      ];
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        techs: mockTechs,
      };

      req.params.user_id = '1';
      User.findByPk.mockResolvedValue(mockUser);

      await TechController.index(req, res);

      expect(User.findByPk).toHaveBeenCalledTimes(1);
      expect(User.findByPk).toHaveBeenCalledWith('1', {
        include: {
          association: 'techs',
          attributes: ['name'],
          through: {
            attributes: [],
          },
        },
      });
      expect(res.json).toHaveBeenCalledWith(mockTechs);
    });

    it('should return 404 when user is not found', async () => {
      req.params.user_id = '999';
      User.findByPk.mockResolvedValue(null);

      await TechController.index(req, res);

      expect(User.findByPk).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return empty array when user has no techs', async () => {
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        techs: [],
      };

      req.params.user_id = '1';
      User.findByPk.mockResolvedValue(mockUser);

      await TechController.index(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      req.params.user_id = '1';
      User.findByPk.mockRejectedValue(error);

      await expect(TechController.index(req, res)).rejects.toThrow('Database error');
    });
  });

  describe('store', () => {
    it('should create a new tech and add to user', async () => {
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        addTech: jest.fn().mockResolvedValue(true),
      };
      const mockTech = { id: 1, name: 'React' };

      req.params.user_id = '1';
      req.body = { name: 'React' };
      User.findByPk.mockResolvedValue(mockUser);
      Tech.findOrCreate.mockResolvedValue([mockTech, true]);

      await TechController.store(req, res);

      expect(User.findByPk).toHaveBeenCalledTimes(1);
      expect(User.findByPk).toHaveBeenCalledWith('1');
      expect(Tech.findOrCreate).toHaveBeenCalledTimes(1);
      expect(Tech.findOrCreate).toHaveBeenCalledWith({
        where: { name: 'React' },
      });
      expect(mockUser.addTech).toHaveBeenCalledWith(mockTech);
      expect(res.json).toHaveBeenCalledWith(mockTech);
    });

    it('should use existing tech if already exists', async () => {
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        addTech: jest.fn().mockResolvedValue(true),
      };
      const mockTech = { id: 5, name: 'Node.js' };

      req.params.user_id = '1';
      req.body = { name: 'Node.js' };
      User.findByPk.mockResolvedValue(mockUser);
      Tech.findOrCreate.mockResolvedValue([mockTech, false]);

      await TechController.store(req, res);

      expect(Tech.findOrCreate).toHaveBeenCalledWith({
        where: { name: 'Node.js' },
      });
      expect(mockUser.addTech).toHaveBeenCalledWith(mockTech);
      expect(res.json).toHaveBeenCalledWith(mockTech);
    });

    it('should return 400 when user is not found', async () => {
      req.params.user_id = '999';
      req.body = { name: 'React' };
      User.findByPk.mockResolvedValue(null);

      await TechController.store(req, res);

      expect(User.findByPk).toHaveBeenCalledTimes(1);
      expect(Tech.findOrCreate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should handle database errors on findOrCreate', async () => {
      const error = new Error('Database error');
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        addTech: jest.fn(),
      };

      req.params.user_id = '1';
      req.body = { name: 'React' };
      User.findByPk.mockResolvedValue(mockUser);
      Tech.findOrCreate.mockRejectedValue(error);

      await expect(TechController.store(req, res)).rejects.toThrow('Database error');
    });

    it('should handle errors on addTech', async () => {
      const error = new Error('Association error');
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        addTech: jest.fn().mockRejectedValue(error),
      };
      const mockTech = { id: 1, name: 'React' };

      req.params.user_id = '1';
      req.body = { name: 'React' };
      User.findByPk.mockResolvedValue(mockUser);
      Tech.findOrCreate.mockResolvedValue([mockTech, true]);

      await expect(TechController.store(req, res)).rejects.toThrow('Association error');
    });
  });

  describe('delete', () => {
    it('should remove tech from user', async () => {
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        removeTech: jest.fn().mockResolvedValue(true),
      };
      const mockTech = { id: 1, name: 'React' };

      req.params.user_id = '1';
      req.body = { name: 'React' };
      User.findByPk.mockResolvedValue(mockUser);
      Tech.findOne.mockResolvedValue(mockTech);

      await TechController.delete(req, res);

      expect(User.findByPk).toHaveBeenCalledTimes(1);
      expect(User.findByPk).toHaveBeenCalledWith('1');
      expect(Tech.findOne).toHaveBeenCalledTimes(1);
      expect(Tech.findOne).toHaveBeenCalledWith({
        where: { name: 'React' },
      });
      expect(mockUser.removeTech).toHaveBeenCalledWith(mockTech);
      expect(res.json).toHaveBeenCalledWith();
    });

    it('should return 400 when user is not found', async () => {
      req.params.user_id = '999';
      req.body = { name: 'React' };
      User.findByPk.mockResolvedValue(null);

      await TechController.delete(req, res);

      expect(User.findByPk).toHaveBeenCalledTimes(1);
      expect(Tech.findOne).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should handle when tech is not found', async () => {
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        removeTech: jest.fn().mockResolvedValue(true),
      };

      req.params.user_id = '1';
      req.body = { name: 'NonExistent' };
      User.findByPk.mockResolvedValue(mockUser);
      Tech.findOne.mockResolvedValue(null);

      await TechController.delete(req, res);

      expect(mockUser.removeTech).toHaveBeenCalledWith(null);
      expect(res.json).toHaveBeenCalledWith();
    });

    it('should handle database errors on findOne', async () => {
      const error = new Error('Database error');
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        removeTech: jest.fn(),
      };

      req.params.user_id = '1';
      req.body = { name: 'React' };
      User.findByPk.mockResolvedValue(mockUser);
      Tech.findOne.mockRejectedValue(error);

      await expect(TechController.delete(req, res)).rejects.toThrow('Database error');
    });

    it('should handle errors on removeTech', async () => {
      const error = new Error('Association error');
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        removeTech: jest.fn().mockRejectedValue(error),
      };
      const mockTech = { id: 1, name: 'React' };

      req.params.user_id = '1';
      req.body = { name: 'React' };
      User.findByPk.mockResolvedValue(mockUser);
      Tech.findOne.mockResolvedValue(mockTech);

      await expect(TechController.delete(req, res)).rejects.toThrow('Association error');
    });
  });
});
