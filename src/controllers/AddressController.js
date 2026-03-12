const User = require('../models/User');
const Address = require('../models/Address');

module.exports = {
  async index(req, res) {
    try {
      const { user_id } = req.params;

      const user = await User.findByPk(user_id, {
        include: { association: 'addresses' },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json(user.addresses);
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async store(req, res) {
    try {
      const { user_id } = req.params;
      const { zipcode, street, number } = req.body;

      if (!zipcode || !street || !number) {
        return res.status(400).json({ error: 'zipcode, street and number are required' });
      }

      const user = await User.findByPk(user_id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const address = await Address.create({
        zipcode,
        street,
        number,
        user_id,
      });

      return res.status(201).json(address);
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async update(req, res) {
    try {
      const { user_id, address_id } = req.params;
      const { zipcode, street, number } = req.body;

      const user = await User.findByPk(user_id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const address = await Address.findOne({ where: { id: address_id, user_id } });
      if (!address) {
        return res.status(404).json({ error: 'Address not found' });
      }

      await address.update({ zipcode, street, number });
      return res.json(address);
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async destroy(req, res) {
    try {
      const { user_id, address_id } = req.params;

      const user = await User.findByPk(user_id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const address = await Address.findOne({ where: { id: address_id, user_id } });
      if (!address) {
        return res.status(404).json({ error: 'Address not found' });
      }

      await address.destroy();
      return res.status(204).send();
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};
