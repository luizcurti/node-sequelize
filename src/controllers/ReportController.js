const { Op } = require('sequelize');
const sequelize = require('../database');
const User = require('../models/User');

const isSqliteDialect = () => sequelize.getDialect && sequelize.getDialect() === 'sqlite';

module.exports = {
  async show(req, res) {
    try {
      const sqlite = isSqliteDialect();
      const likeOp = sqlite ? Op.like : Op.iLike;

      const users = await User.findAll({
        attributes: ['name', 'email'],
        where: {
          email: { [likeOp]: '%@mail.com%' },
        },
        include: [
          {
            association: 'addresses',
            where: { street: 'Regent Street' },
          },
          {
            association: 'techs',
            required: false,
            where: { name: { [likeOp]: 'React%' } },
          },
        ],
      });

      return res.json(users);
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};
