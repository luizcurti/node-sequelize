const { Sequelize } = require('sequelize');
const Tech = require('../../models/Tech');
const User = require('../../models/User');
const Address = require('../../models/Address');

describe('Tech Model', () => {
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
    Tech.associate({ User });
  });

  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('init', () => {
    it('should initialize Tech model with correct attributes', () => {
      const attributes = Tech.getAttributes();

      expect(attributes).toHaveProperty('name');
      expect(attributes.name.type.constructor.name).toBe('STRING');
    });

    it('should use correct table name', () => {
      expect(Tech.tableName).toBe('techs');
    });
  });

  describe('associate', () => {
    it('should have belongsToMany association with User through user_techs', async () => {
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
      });

      const tech = await Tech.create({
        name: 'JavaScript',
      });

      await tech.addUser(user);

      const techWithUsers = await Tech.findByPk(tech.id, {
        include: 'users',
      });

      expect(techWithUsers.users).toHaveLength(1);
      expect(techWithUsers.users[0].id).toBe(user.id);
      expect(techWithUsers.users[0].name).toBe('John Doe');
    });
  });

  describe('CRUD operations', () => {
    it('should create a tech', async () => {
      const tech = await Tech.create({
        name: 'React',
      });

      expect(tech.id).toBeDefined();
      expect(tech.name).toBe('React');
    });

    it('should find all techs', async () => {
      await Tech.create({ name: 'Vue.js' });
      await Tech.create({ name: 'Angular' });

      const techs = await Tech.findAll();

      expect(techs).toHaveLength(2);
    });

    it('should find tech by primary key', async () => {
      const createdTech = await Tech.create({
        name: 'Node.js',
      });

      const foundTech = await Tech.findByPk(createdTech.id);

      expect(foundTech.id).toBe(createdTech.id);
      expect(foundTech.name).toBe('Node.js');
    });

    it('should find tech by name', async () => {
      await Tech.create({ name: 'TypeScript' });

      const foundTech = await Tech.findOne({
        where: { name: 'TypeScript' },
      });

      expect(foundTech).not.toBeNull();
      expect(foundTech.name).toBe('TypeScript');
    });

    it('should update a tech', async () => {
      const tech = await Tech.create({
        name: 'Old Framework',
      });

      await tech.update({ name: 'New Framework' });

      expect(tech.name).toBe('New Framework');
    });

    it('should delete a tech', async () => {
      const tech = await Tech.create({
        name: 'Delete Me',
      });

      await tech.destroy();

      const foundTech = await Tech.findByPk(tech.id);

      expect(foundTech).toBeNull();
    });
  });

  describe('many-to-many relationship', () => {
    it('should handle multiple users for one tech', async () => {
      const user1 = await User.create({ name: 'User 1', email: 'user1@example.com' });
      const user2 = await User.create({ name: 'User 2', email: 'user2@example.com' });

      const tech = await Tech.create({ name: 'Python' });

      await tech.addUser(user1);
      await tech.addUser(user2);

      const techWithUsers = await Tech.findByPk(tech.id, {
        include: 'users',
      });

      expect(techWithUsers.users).toHaveLength(2);
    });

    it('should handle multiple techs for one user', async () => {
      const user = await User.create({ name: 'Developer', email: 'dev@example.com' });

      const tech1 = await Tech.create({ name: 'JavaScript' });
      const tech2 = await Tech.create({ name: 'Python' });

      await user.addTech(tech1);
      await user.addTech(tech2);

      const userWithTechs = await User.findByPk(user.id, {
        include: 'techs',
      });

      expect(userWithTechs.techs).toHaveLength(2);
    });
  });
});
