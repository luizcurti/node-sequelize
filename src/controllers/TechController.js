const User = require('../models/User');
const Tech = require('../models/Tech');

module.exports = {
  async index(req, res) {
    try {
      const { user_id } = req.params;

      const user = await User.findByPk(user_id, {
        include: {
          association: 'techs',
          attributes: ['name'],
          through: {
            attributes: [],
          },
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json(user.techs);
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async store(req, res) {
    try {
      const { user_id } = req.params;
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Tech name is required' });
      }

      const user = await User.findByPk(user_id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const [tech] = await Tech.findOrCreate({
        where: { name },
      });

      await user.addTech(tech);

      return res.status(201).json(tech);
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async delete(req, res) {
    try {
      const { user_id } = req.params;
      const { name } = req.query;

      if (!name) {
        return res.status(400).json({ error: 'Tech name query param is required' });
      }

      const user = await User.findByPk(user_id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const tech = await Tech.findOne({ where: { name } });

      if (!tech) {
        return res.status(404).json({ error: 'Tech not found' });
      }

      await user.removeTech(tech);

      return res.status(204).send();
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};
