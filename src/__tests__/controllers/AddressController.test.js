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
      send: jest.fn().mockReturnThis(),
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

      expect(User.findByPk).toHaveBeenCalledWith('1', {
        include: { association: 'addresses' },
      });
      expect(res.json).toHaveBeenCalledWith(mockAddresses);
    });

    it('should return 404 when user is not found', async () => {
      req.params.user_id = '999';
      User.findByPk.mockResolvedValue(null);

      await AddressController.index(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return empty array when user has no addresses', async () => {
      const mockUser = { id: 1, addresses: [] };
      req.params.user_id = '1';
      User.findByPk.mockResolvedValue(mockUser);

      await AddressController.index(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should return 500 on database error', async () => {
      req.params.user_id = '1';
      User.findByPk.mockRejectedValue(new Error('DB error'));

      await AddressController.index(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('store', () => {
    it('should create a new address and return 201', async () => {
      const addressData = { zipcode: '12345', street: 'Main Street', number: 123 };
      const mockUser = { id: 1 };
      const mockAddress = { id: 1, ...addressData, user_id: 1 };

      req.params.user_id = '1';
      req.body = addressData;
      User.findByPk.mockResolvedValue(mockUser);
      Address.create.mockResolvedValue(mockAddress);

      await AddressController.store(req, res);

      expect(Address.create).toHaveBeenCalledWith({
        zipcode: '12345',
        street: 'Main Street',
        number: 123,
        user_id: '1',
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockAddress);
    });

    it('should return 400 when required fields are missing', async () => {
      req.params.user_id = '1';
      req.body = { zipcode: '12345' };

      await AddressController.store(req, res);

      expect(Address.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 when user is not found', async () => {
      req.params.user_id = '999';
      req.body = { zipcode: '12345', street: 'Main Street', number: 123 };
      User.findByPk.mockResolvedValue(null);

      await AddressController.store(req, res);

      expect(Address.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return 500 on database error', async () => {
      req.params.user_id = '1';
      req.body = { zipcode: '12345', street: 'Test St', number: 100 };
      User.findByPk.mockResolvedValue({ id: 1 });
      Address.create.mockRejectedValue(new Error('DB error'));

      await AddressController.store(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('update', () => {
    it('should update an address', async () => {
      const mockUser = { id: 1 };
      const mockAddress = {
        id: 1,
        zipcode: '12345',
        street: 'Old St',
        number: 1,
        update: jest.fn().mockResolvedValue(true),
      };
      req.params = { user_id: '1', address_id: '1' };
      req.body = { street: 'New St' };
      User.findByPk.mockResolvedValue(mockUser);
      Address.findOne.mockResolvedValue(mockAddress);

      await AddressController.update(req, res);

      expect(mockAddress.update).toHaveBeenCalledWith({ zipcode: undefined, street: 'New St', number: undefined });
      expect(res.json).toHaveBeenCalledWith(mockAddress);
    });

    it('should return 404 when user not found', async () => {
      req.params = { user_id: '999', address_id: '1' };
      req.body = {};
      User.findByPk.mockResolvedValue(null);

      await AddressController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return 404 when address not found', async () => {
      req.params = { user_id: '1', address_id: '999' };
      req.body = {};
      User.findByPk.mockResolvedValue({ id: 1 });
      Address.findOne.mockResolvedValue(null);

      await AddressController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Address not found' });
    });

    it('should return 500 on database error', async () => {
      req.params = { user_id: '1', address_id: '1' };
      req.body = {};
      User.findByPk.mockRejectedValue(new Error('DB error'));

      await AddressController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('destroy', () => {
    it('should delete address and return 204', async () => {
      const mockUser = { id: 1 };
      const mockAddress = { id: 1, destroy: jest.fn().mockResolvedValue(true) };
      req.params = { user_id: '1', address_id: '1' };
      User.findByPk.mockResolvedValue(mockUser);
      Address.findOne.mockResolvedValue(mockAddress);

      await AddressController.destroy(req, res);

      expect(mockAddress.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should return 404 when user not found', async () => {
      req.params = { user_id: '999', address_id: '1' };
      User.findByPk.mockResolvedValue(null);

      await AddressController.destroy(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 404 when address not found', async () => {
      req.params = { user_id: '1', address_id: '999' };
      User.findByPk.mockResolvedValue({ id: 1 });
      Address.findOne.mockResolvedValue(null);

      await AddressController.destroy(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 on database error', async () => {
      req.params = { user_id: '1', address_id: '1' };
      User.findByPk.mockRejectedValue(new Error('DB error'));

      await AddressController.destroy(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
