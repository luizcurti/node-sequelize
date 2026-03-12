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
      query: {},
    };
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
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

      expect(User.findByPk).toHaveBeenCalledWith('1', {
        include: {
          association: 'techs',
          attributes: ['name'],
          through: { attributes: [] },
        },
      });
      expect(res.json).toHaveBeenCalledWith(mockTechs);
    });

    it('should return 404 when user is not found', async () => {
      req.params.user_id = '999';
      User.findByPk.mockResolvedValue(null);

      await TechController.index(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return empty array when user has no techs', async () => {
      User.findByPk.mockResolvedValue({ id: 1, techs: [] });
      req.params.user_id = '1';

      await TechController.index(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should return 500 on database error', async () => {
      req.params.user_id = '1';
      User.findByPk.mockRejectedValue(new Error('DB error'));

      await TechController.index(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('store', () => {
    it('should create a new tech and return 201', async () => {
      const mockUser = {
        id: 1,
        addTech: jest.fn().mockResolvedValue(true),
      };
      const mockTech = { id: 1, name: 'React' };

      req.params.user_id = '1';
      req.body = { name: 'React' };
      User.findByPk.mockResolvedValue(mockUser);
      Tech.findOrCreate.mockResolvedValue([mockTech, true]);

      await TechController.store(req, res);

      expect(Tech.findOrCreate).toHaveBeenCalledWith({ where: { name: 'React' } });
      expect(mockUser.addTech).toHaveBeenCalledWith(mockTech);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockTech);
    });

    it('should return 400 when tech name is missing', async () => {
      req.params.user_id = '1';
      req.body = {};

      await TechController.store(req, res);

      expect(Tech.findOrCreate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 when user is not found', async () => {
      req.params.user_id = '999';
      req.body = { name: 'React' };
      User.findByPk.mockResolvedValue(null);

      await TechController.store(req, res);

      expect(Tech.findOrCreate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return 500 on database error', async () => {
      req.params.user_id = '1';
      req.body = { name: 'React' };
      User.findByPk.mockResolvedValue({ id: 1, addTech: jest.fn() });
      Tech.findOrCreate.mockRejectedValue(new Error('DB error'));

      await TechController.store(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('delete', () => {
    it('should remove tech from user and return 204', async () => {
      const mockUser = {
        id: 1,
        removeTech: jest.fn().mockResolvedValue(true),
      };
      const mockTech = { id: 1, name: 'React' };

      req.params.user_id = '1';
      req.query = { name: 'React' };
      User.findByPk.mockResolvedValue(mockUser);
      Tech.findOne.mockResolvedValue(mockTech);

      await TechController.delete(req, res);

      expect(User.findByPk).toHaveBeenCalledWith('1');
      expect(Tech.findOne).toHaveBeenCalledWith({ where: { name: 'React' } });
      expect(mockUser.removeTech).toHaveBeenCalledWith(mockTech);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should return 400 when query param name is missing', async () => {
      req.params.user_id = '1';
      req.query = {};

      await TechController.delete(req, res);

      expect(User.findByPk).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 when user is not found', async () => {
      req.params.user_id = '999';
      req.query = { name: 'React' };
      User.findByPk.mockResolvedValue(null);

      await TechController.delete(req, res);

      expect(Tech.findOne).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return 404 when tech does not exist', async () => {
      req.params.user_id = '1';
      req.query = { name: 'NonExistent' };
      User.findByPk.mockResolvedValue({ id: 1, removeTech: jest.fn() });
      Tech.findOne.mockResolvedValue(null);

      await TechController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Tech not found' });
    });

    it('should return 500 on database error', async () => {
      req.params.user_id = '1';
      req.query = { name: 'React' };
      User.findByPk.mockRejectedValue(new Error('DB error'));

      await TechController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
