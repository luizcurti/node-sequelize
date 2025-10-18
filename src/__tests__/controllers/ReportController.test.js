jest.mock('../../models/User');
jest.mock('../../database', () => ({
  getDialect: jest.fn(),
}));

const ReportController = require('../../controllers/ReportController');
const User = require('../../models/User');
const sequelize = require('../../database');

describe('ReportController', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {};
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('show', () => {
    it('should return users with specific criteria (SQLite)', async () => {
      const mockUsers = [
        {
          name: 'John Doe',
          email: 'john@mail.com',
          addresses: [
            {
              street: 'Regent Street',
            },
          ],
          techs: [
            {
              name: 'React',
            },
          ],
        },
      ];

      sequelize.getDialect = jest.fn().mockReturnValue('sqlite');
      User.findAll.mockResolvedValue(mockUsers);

      await ReportController.show(req, res);

      expect(sequelize.getDialect).toHaveBeenCalled();
      expect(User.findAll).toHaveBeenCalledTimes(1);

      const callArgs = User.findAll.mock.calls[0][0];
      expect(callArgs.attributes).toEqual(['name', 'email']);
      expect(callArgs.include).toHaveLength(2);
      expect(callArgs.include[0].association).toBe('addresses');
      expect(callArgs.include[0].where.street).toBe('Regent Street');
      expect(callArgs.include[1].association).toBe('techs');
      expect(callArgs.include[1].required).toBe(false);

      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should return users with specific criteria (PostgreSQL)', async () => {
      const mockUsers = [
        {
          name: 'Jane Doe',
          email: 'jane@mail.com',
          addresses: [
            {
              street: 'Regent Street',
            },
          ],
          techs: [],
        },
      ];

      sequelize.getDialect = jest.fn().mockReturnValue('postgres');
      User.findAll.mockResolvedValue(mockUsers);

      await ReportController.show(req, res);

      expect(sequelize.getDialect).toHaveBeenCalled();
      expect(User.findAll).toHaveBeenCalledTimes(1);

      const callArgs = User.findAll.mock.calls[0][0];
      expect(callArgs.attributes).toEqual(['name', 'email']);
      expect(callArgs.include).toHaveLength(2);
      expect(callArgs.include[0].association).toBe('addresses');
      expect(callArgs.include[1].association).toBe('techs');

      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should return users with specific criteria (MySQL)', async () => {
      const mockUsers = [
        {
          name: 'Test User',
          email: 'test@mail.com',
          addresses: [
            {
              street: 'Regent Street',
            },
          ],
          techs: [
            {
              name: 'React Native',
            },
          ],
        },
      ];

      sequelize.getDialect = jest.fn().mockReturnValue('mysql');
      User.findAll.mockResolvedValue(mockUsers);

      await ReportController.show(req, res);

      expect(sequelize.getDialect).toHaveBeenCalled();
      expect(User.findAll).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should return empty array when no users match criteria', async () => {
      sequelize.getDialect = jest.fn().mockReturnValue('postgres');
      User.findAll.mockResolvedValue([]);

      await ReportController.show(req, res);

      expect(User.findAll).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      sequelize.getDialect = jest.fn().mockReturnValue('postgres');
      User.findAll.mockRejectedValue(error);

      await expect(ReportController.show(req, res)).rejects.toThrow('Database error');
      expect(User.findAll).toHaveBeenCalledTimes(1);
    });

    it('should handle when getDialect is not available', async () => {
      const mockUsers = [
        {
          name: 'User',
          email: 'user@mail.com',
          addresses: [
            {
              street: 'Regent Street',
            },
          ],
          techs: [],
        },
      ];

      sequelize.getDialect = undefined;
      User.findAll.mockResolvedValue(mockUsers);

      await ReportController.show(req, res);

      expect(User.findAll).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should filter by email containing @mail.com (SQLite)', async () => {
      const mockUsers = [
        {
          name: 'User 1',
          email: 'user1@mail.com',
          addresses: [
            {
              street: 'Regent Street',
            },
          ],
          techs: [],
        },
      ];

      sequelize.getDialect = jest.fn().mockReturnValue('sqlite');
      User.findAll.mockResolvedValue(mockUsers);

      await ReportController.show(req, res);

      const callArgs = User.findAll.mock.calls[0][0];
      expect(callArgs.where.email).toBeDefined();
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should filter techs by name starting with React', async () => {
      const mockUsers = [
        {
          name: 'Developer',
          email: 'dev@mail.com',
          addresses: [
            {
              street: 'Regent Street',
            },
          ],
          techs: [
            {
              name: 'React',
            },
            {
              name: 'React Native',
            },
          ],
        },
      ];

      sequelize.getDialect = jest.fn().mockReturnValue('postgres');
      User.findAll.mockResolvedValue(mockUsers);

      await ReportController.show(req, res);

      const callArgs = User.findAll.mock.calls[0][0];
      expect(callArgs.include[1].where.name).toBeDefined();
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should include addresses with street Regent Street', async () => {
      const mockUsers = [
        {
          name: 'User',
          email: 'user@mail.com',
          addresses: [
            {
              street: 'Regent Street',
            },
          ],
          techs: [],
        },
      ];

      sequelize.getDialect = jest.fn().mockReturnValue('postgres');
      User.findAll.mockResolvedValue(mockUsers);

      await ReportController.show(req, res);

      const callArgs = User.findAll.mock.calls[0][0];
      expect(callArgs.include[0].where.street).toBe('Regent Street');
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });
  });
});
