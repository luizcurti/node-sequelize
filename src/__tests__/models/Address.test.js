const { Sequelize } = require('sequelize');
const Address = require('../../models/Address');
const User = require('../../models/User');
const Tech = require('../../models/Tech');

describe('Address Model', () => {
  let sequelize;

  beforeAll(() => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    User.init(sequelize);
    Address.init(sequelize);
    Tech.init(sequelize);

    User.associate({ Address, Tech });
    Address.associate({ User });
  });

  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('init', () => {
    it('should initialize Address model with correct attributes', () => {
      const attributes = Address.getAttributes();

      expect(attributes).toHaveProperty('zipcode');
      expect(attributes).toHaveProperty('street');
      expect(attributes).toHaveProperty('number');
      expect(attributes.zipcode.type.constructor.name).toBe('STRING');
      expect(attributes.street.type.constructor.name).toBe('STRING');
      expect(attributes.number.type.constructor.name).toBe('INTEGER');
    });

    it('should use correct table name', () => {
      expect(Address.tableName).toBe('addresses');
    });
  });

  describe('associate', () => {
    it('should have belongsTo association with User', async () => {
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
      });

      const address = await Address.create({
        zipcode: '12345',
        street: 'Main Street',
        number: 123,
        user_id: user.id,
      });

      const addressWithUser = await Address.findByPk(address.id, {
        include: 'user',
      });

      expect(addressWithUser.user.id).toBe(user.id);
      expect(addressWithUser.user.name).toBe('John Doe');
    });
  });

  describe('CRUD operations', () => {
    let user;

    beforeEach(async () => {
      user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
      });
    });

    it('should create an address', async () => {
      const address = await Address.create({
        zipcode: '54321',
        street: 'Oak Avenue',
        number: 456,
        user_id: user.id,
      });

      expect(address.id).toBeDefined();
      expect(address.zipcode).toBe('54321');
      expect(address.street).toBe('Oak Avenue');
      expect(address.number).toBe(456);
      expect(address.user_id).toBe(user.id);
    });

    it('should find all addresses', async () => {
      await Address.create({
        zipcode: '11111',
        street: 'Street 1',
        number: 1,
        user_id: user.id,
      });
      await Address.create({
        zipcode: '22222',
        street: 'Street 2',
        number: 2,
        user_id: user.id,
      });

      const addresses = await Address.findAll();

      expect(addresses).toHaveLength(2);
    });

    it('should find address by primary key', async () => {
      const createdAddress = await Address.create({
        zipcode: '99999',
        street: 'Find Me Street',
        number: 999,
        user_id: user.id,
      });

      const foundAddress = await Address.findByPk(createdAddress.id);

      expect(foundAddress.id).toBe(createdAddress.id);
      expect(foundAddress.street).toBe('Find Me Street');
    });

    it('should update an address', async () => {
      const address = await Address.create({
        zipcode: '00000',
        street: 'Old Street',
        number: 100,
        user_id: user.id,
      });

      await address.update({ street: 'New Street' });

      expect(address.street).toBe('New Street');
    });

    it('should delete an address', async () => {
      const address = await Address.create({
        zipcode: '88888',
        street: 'Delete Street',
        number: 888,
        user_id: user.id,
      });

      await address.destroy();

      const foundAddress = await Address.findByPk(address.id);

      expect(foundAddress).toBeNull();
    });
  });
});
