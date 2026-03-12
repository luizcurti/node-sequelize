const User = require('../models/User');

module.exports = {
  async index(req, res) {
    try {
      const users = await User.findAll();
      return res.json(users);
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async store(req, res) {
    try {
      const { name, email } = req.body;

      if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
      }

      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ error: 'Email already in use' });
      }

      const user = await User.create({ name, email });
      return res.status(201).json(user);
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, email } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (email && email !== user.email) {
        const existing = await User.findOne({ where: { email } });
        if (existing) {
          return res.status(409).json({ error: 'Email already in use' });
        }
      }

      await user.update({ name, email });
      return res.json(user);
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async destroy(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await user.destroy();
      return res.status(204).send();
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};
