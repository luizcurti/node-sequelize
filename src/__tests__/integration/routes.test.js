/**
 * Integration tests for all routes using supertest + SQLite in-memory.
 * These tests exercise the full Express stack: routes → controllers → models.
 */
const request = require('supertest');

// Must be set before requiring app so database/index.js picks the test config
process.env.NODE_ENV = 'test';

const app = require('../../app');
const sequelize = require('../../database');

const User = require('../../models/User');
const Address = require('../../models/Address');
const Tech = require('../../models/Tech');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

beforeEach(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
describe('Users routes', () => {
  describe('GET /users', () => {
    it('returns empty array when no users', async () => {
      const res = await request(app).get('/users');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('returns all users', async () => {
      await User.create({ name: 'Alice', email: 'alice@example.com' });
      await User.create({ name: 'Bob', email: 'bob@example.com' });

      const res = await request(app).get('/users');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });
  });

  describe('POST /users', () => {
    it('creates a user and returns 201', async () => {
      const res = await request(app)
        .post('/users')
        .send({ name: 'Alice', email: 'alice@example.com' });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ name: 'Alice', email: 'alice@example.com' });
      expect(res.body.id).toBeDefined();
    });

    it('returns 400 when name is missing', async () => {
      const res = await request(app).post('/users').send({ email: 'no-name@example.com' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when email is missing', async () => {
      const res = await request(app).post('/users').send({ name: 'No Email' });
      expect(res.status).toBe(400);
    });

    it('returns 409 when email is already taken', async () => {
      await User.create({ name: 'Alice', email: 'alice@example.com' });

      const res = await request(app)
        .post('/users')
        .send({ name: 'Alice 2', email: 'alice@example.com' });

      expect(res.status).toBe(409);
    });
  });

  describe('PUT /users/:id', () => {
    it('updates a user', async () => {
      const user = await User.create({ name: 'Alice', email: 'alice@example.com' });

      const res = await request(app)
        .put(`/users/${user.id}`)
        .send({ name: 'Alice Updated', email: 'alice@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Alice Updated');
    });

    it('returns 404 for non-existent user', async () => {
      const res = await request(app).put('/users/9999').send({ name: 'X' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /users/:id', () => {
    it('deletes a user and returns 204', async () => {
      const user = await User.create({ name: 'Alice', email: 'alice@example.com' });

      const res = await request(app).delete(`/users/${user.id}`);
      expect(res.status).toBe(204);

      const found = await User.findByPk(user.id);
      expect(found).toBeNull();
    });

    it('returns 404 for non-existent user', async () => {
      const res = await request(app).delete('/users/9999');
      expect(res.status).toBe(404);
    });
  });
});

// ---------------------------------------------------------------------------
// Addresses
// ---------------------------------------------------------------------------
describe('Addresses routes', () => {
  let user;

  beforeEach(async () => {
    user = await User.create({ name: 'Alice', email: 'alice@example.com' });
  });

  describe('GET /users/:user_id/addresses', () => {
    it('returns empty array when user has no addresses', async () => {
      const res = await request(app).get(`/users/${user.id}/addresses`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('returns user addresses', async () => {
      await Address.create({
        zipcode: '12345', street: 'Main St', number: 1, user_id: user.id,
      });

      const res = await request(app).get(`/users/${user.id}/addresses`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].street).toBe('Main St');
    });

    it('returns 404 for non-existent user', async () => {
      const res = await request(app).get('/users/9999/addresses');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /users/:user_id/addresses', () => {
    it('creates an address and returns 201', async () => {
      const res = await request(app)
        .post(`/users/${user.id}/addresses`)
        .send({ zipcode: '01001-000', street: 'Avenida Paulista', number: 1000 });

      expect(res.status).toBe(201);
      expect(res.body.street).toBe('Avenida Paulista');
    });

    it('returns 400 when required fields are missing', async () => {
      const res = await request(app)
        .post(`/users/${user.id}/addresses`)
        .send({ zipcode: '12345' });

      expect(res.status).toBe(400);
    });

    it('returns 404 for non-existent user', async () => {
      const res = await request(app)
        .post('/users/9999/addresses')
        .send({ zipcode: '12345', street: 'Test St', number: 1 });

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /users/:user_id/addresses/:address_id', () => {
    it('updates an address', async () => {
      const address = await Address.create({
        zipcode: '12345', street: 'Old St', number: 1, user_id: user.id,
      });

      const res = await request(app)
        .put(`/users/${user.id}/addresses/${address.id}`)
        .send({ street: 'New St' });

      expect(res.status).toBe(200);
      expect(res.body.street).toBe('New St');
    });

    it('returns 404 when address not found', async () => {
      const res = await request(app)
        .put(`/users/${user.id}/addresses/9999`)
        .send({ street: 'X' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /users/:user_id/addresses/:address_id', () => {
    it('deletes an address and returns 204', async () => {
      const address = await Address.create({
        zipcode: '12345', street: 'Main St', number: 1, user_id: user.id,
      });

      const res = await request(app).delete(`/users/${user.id}/addresses/${address.id}`);
      expect(res.status).toBe(204);
    });

    it('returns 404 when address not found', async () => {
      const res = await request(app).delete(`/users/${user.id}/addresses/9999`);
      expect(res.status).toBe(404);
    });
  });
});

// ---------------------------------------------------------------------------
// Techs
// ---------------------------------------------------------------------------
describe('Techs routes', () => {
  let user;

  beforeEach(async () => {
    user = await User.create({ name: 'Alice', email: 'alice@example.com' });
  });

  describe('GET /users/:user_id/techs', () => {
    it('returns empty array when user has no techs', async () => {
      const res = await request(app).get(`/users/${user.id}/techs`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('returns associated techs', async () => {
      const tech = await Tech.create({ name: 'Node.js' });
      await user.addTech(tech);

      const res = await request(app).get(`/users/${user.id}/techs`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe('Node.js');
    });

    it('returns 404 for non-existent user', async () => {
      const res = await request(app).get('/users/9999/techs');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /users/:user_id/techs', () => {
    it('creates a tech and associates it with the user, returns 201', async () => {
      const res = await request(app)
        .post(`/users/${user.id}/techs`)
        .send({ name: 'React' });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('React');
    });

    it('reuses existing tech if already registered', async () => {
      await Tech.create({ name: 'React' });

      const res = await request(app)
        .post(`/users/${user.id}/techs`)
        .send({ name: 'React' });

      expect(res.status).toBe(201);
      const total = await Tech.findAll();
      expect(total).toHaveLength(1);
    });

    it('returns 400 when name is missing', async () => {
      const res = await request(app).post(`/users/${user.id}/techs`).send({});
      expect(res.status).toBe(400);
    });

    it('returns 404 for non-existent user', async () => {
      const res = await request(app).post('/users/9999/techs').send({ name: 'React' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /users/:user_id/techs', () => {
    it('removes tech from user and returns 204', async () => {
      const tech = await Tech.create({ name: 'Vue.js' });
      await user.addTech(tech);

      const res = await request(app).delete(`/users/${user.id}/techs?name=Vue.js`);
      expect(res.status).toBe(204);

      const techs = await user.getTechs();
      expect(techs).toHaveLength(0);
    });

    it('returns 400 when name query param is missing', async () => {
      const res = await request(app).delete(`/users/${user.id}/techs`);
      expect(res.status).toBe(400);
    });

    it('returns 404 when tech does not exist', async () => {
      const res = await request(app).delete(`/users/${user.id}/techs?name=NonExistent`);
      expect(res.status).toBe(404);
    });

    it('returns 404 for non-existent user', async () => {
      const res = await request(app).delete('/users/9999/techs?name=React');
      expect(res.status).toBe(404);
    });
  });
});

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
describe('Report routes', () => {
  describe('GET /report', () => {
    it('returns users with @mail.com email, street Regent Street and React tech', async () => {
      const user = await User.create({ name: 'Alice', email: 'alice@mail.com' });
      await Address.create({
        zipcode: '12345', street: 'Regent Street', number: 1, user_id: user.id,
      });
      const tech = await Tech.create({ name: 'React' });
      await user.addTech(tech);

      const res = await request(app).get('/report');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe('Alice');
      expect(res.body[0].email).toBe('alice@mail.com');
      expect(res.body[0].addresses[0].street).toBe('Regent Street');
    });

    it('does not return users with wrong email domain', async () => {
      const user = await User.create({ name: 'Bob', email: 'bob@other.com' });
      await Address.create({
        zipcode: '12345', street: 'Regent Street', number: 1, user_id: user.id,
      });

      const res = await request(app).get('/report');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(0);
    });

    it('does not return users without address on Regent Street', async () => {
      const user = await User.create({ name: 'Carol', email: 'carol@mail.com' });
      await Address.create({
        zipcode: '12345', street: 'Other Street', number: 1, user_id: user.id,
      });

      const res = await request(app).get('/report');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(0);
    });

    it('returns empty array when no users match', async () => {
      const res = await request(app).get('/report');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('returns only name and email fields', async () => {
      const user = await User.create({ name: 'Dave', email: 'dave@mail.com' });
      await Address.create({
        zipcode: '99999', street: 'Regent Street', number: 5, user_id: user.id,
      });

      const res = await request(app).get('/report');
      expect(res.status).toBe(200);
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('email');
      expect(res.body[0]).not.toHaveProperty('id');
      expect(res.body[0]).not.toHaveProperty('created_at');
    });
  });
});
