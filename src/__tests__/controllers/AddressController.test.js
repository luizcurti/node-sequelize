const AddressController = require('../../controllers/AddressController');
const User = require('../../models/User');
const Address = require('../../models/Address');

jest.mock('../../models/User');
jest.mock('../../models/Address');

describe('AddressController', () => {
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
    it('should return all addresses for a user', async () => {
      const mockAddresses = [
        {
          id: 1, zipcode: '12345', street: 'Main St', number: 123,
        },
        {
          id: 2, zipcode: '54321', street: 'Oak Ave', number: 456,
        },
      ];
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        addresses: mockAddresses,
      };

      req.params.user_id = '1';
      User.findByPk.mockResolvedValue(mockUser);

      await AddressController.index(req, res);

      expect(User.findByPk).toHaveBeenCalledTimes(1);
      expect(User.findByPk).toHaveBeenCalledWith('1', {
        include: { association: 'addresses' },
      });
      expect(res.json).toHaveBeenCalledWith(mockAddresses);
    });

    it('should return 404 when user is not found', async () => {
      req.params.user_id = '999';
      User.findByPk.mockResolvedValue(null);

      await AddressController.index(req, res);

      expect(User.findByPk).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return empty array when user has no addresses', async () => {
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        addresses: [],
      };

      req.params.user_id = '1';
      User.findByPk.mockResolvedValue(mockUser);

      await AddressController.index(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      req.params.user_id = '1';
      User.findByPk.mockRejectedValue(error);

      await expect(AddressController.index(req, res)).rejects.toThrow('Database error');
    });
  });

  describe('store', () => {
    it('should create a new address for a user', async () => {
      const addressData = {
        zipcode: '12345',
        street: 'Main Street',
        number: 123,
      };
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
      const mockAddress = { id: 1, ...addressData, user_id: 1 };

      req.params.user_id = '1';
      req.body = addressData;
      User.findByPk.mockResolvedValue(mockUser);
      Address.create.mockResolvedValue(mockAddress);

      await AddressController.store(req, res);

      expect(User.findByPk).toHaveBeenCalledTimes(1);
      expect(User.findByPk).toHaveBeenCalledWith('1');
      expect(Address.create).toHaveBeenCalledTimes(1);
      expect(Address.create).toHaveBeenCalledWith({
        zipcode: '12345',
        street: 'Main Street',
        number: 123,
        user_id: '1',
      });
      expect(res.json).toHaveBeenCalledWith(mockAddress);
    });

    it('should return 400 when user is not found', async () => {
      req.params.user_id = '999';
      req.body = {
        zipcode: '12345',
        street: 'Main Street',
        number: 123,
      };
      User.findByPk.mockResolvedValue(null);

      await AddressController.store(req, res);

      expect(User.findByPk).toHaveBeenCalledTimes(1);
      expect(Address.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should create address with all fields', async () => {
      const addressData = {
        zipcode: '99999',
        street: 'Complete Street',
        number: 999,
      };
      const mockUser = { id: 5, name: 'Test User', email: 'test@example.com' };
      const mockAddress = { id: 10, ...addressData, user_id: 5 };

      req.params.user_id = '5';
      req.body = addressData;
      User.findByPk.mockResolvedValue(mockUser);
      Address.create.mockResolvedValue(mockAddress);

      await AddressController.store(req, res);

      expect(Address.create).toHaveBeenCalledWith({
        zipcode: '99999',
        street: 'Complete Street',
        number: 999,
        user_id: '5',
      });
      expect(res.json).toHaveBeenCalledWith(mockAddress);
    });

    it('should handle database errors on create', async () => {
      const error = new Error('Database error');
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };

      req.params.user_id = '1';
      req.body = { zipcode: '12345', street: 'Test St', number: 100 };
      User.findByPk.mockResolvedValue(mockUser);
      Address.create.mockRejectedValue(error);

      await expect(AddressController.store(req, res)).rejects.toThrow('Database error');
    });

    it('should handle validation errors', async () => {
      const error = new Error('Validation error');
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };

      req.params.user_id = '1';
      req.body = { zipcode: '', street: '', number: null };
      User.findByPk.mockResolvedValue(mockUser);
      Address.create.mockRejectedValue(error);

      await expect(AddressController.store(req, res)).rejects.toThrow('Validation error');
    });
  });
});
