const { Sequelize } = require('sequelize');
const User = require('../../models/User');
const Address = require('../../models/Address');
const Tech = require('../../models/Tech');

describe('User Model', () => {
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
    Tech.associate({ User });
  });

  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('init', () => {
    it('should initialize User model with correct attributes', () => {
      const attributes = User.getAttributes();

      expect(attributes).toHaveProperty('name');
      expect(attributes).toHaveProperty('email');
      expect(attributes.name.type.constructor.name).toBe('STRING');
      expect(attributes.email.type.constructor.name).toBe('STRING');
    });

    it('should use correct table name', () => {
      expect(User.tableName).toBe('users');
    });
  });

  describe('associate', () => {
    it('should have hasMany association with Address', async () => {
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

      const userWithAddresses = await User.findByPk(user.id, {
        include: 'addresses',
      });

      expect(userWithAddresses.addresses).toHaveLength(1);
      expect(userWithAddresses.addresses[0].id).toBe(address.id);
    });

    it('should have belongsToMany association with Tech through user_techs', async () => {
      const user = await User.create({
        name: 'Jane Doe',
        email: 'jane@example.com',
      });

      const tech = await Tech.create({
        name: 'Node.js',
      });

      await user.addTech(tech);

      const userWithTechs = await User.findByPk(user.id, {
        include: 'techs',
      });

      expect(userWithTechs.techs).toHaveLength(1);
      expect(userWithTechs.techs[0].name).toBe('Node.js');
    });
  });

  describe('CRUD operations', () => {
    it('should create a user', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
      });

      expect(user.id).toBeDefined();
      expect(user.name).toBe('Test User');
      expect(user.email).toBe('test@example.com');
    });

    it('should find all users', async () => {
      await User.create({ name: 'User 1', email: 'user1@example.com' });
      await User.create({ name: 'User 2', email: 'user2@example.com' });

      const users = await User.findAll();

      expect(users).toHaveLength(2);
    });

    it('should find user by primary key', async () => {
      const createdUser = await User.create({
        name: 'Find Me',
        email: 'findme@example.com',
      });

      const foundUser = await User.findByPk(createdUser.id);

      expect(foundUser.id).toBe(createdUser.id);
      expect(foundUser.name).toBe('Find Me');
    });

    it('should update a user', async () => {
      const user = await User.create({
        name: 'Old Name',
        email: 'old@example.com',
      });

      await user.update({ name: 'New Name' });

      expect(user.name).toBe('New Name');
    });

    it('should delete a user', async () => {
      const user = await User.create({
        name: 'Delete Me',
        email: 'delete@example.com',
      });

      await user.destroy();

      const foundUser = await User.findByPk(user.id);

      expect(foundUser).toBeNull();
    });
  });
});
