const { Op } = require('sequelize');
const sequelize = require('../database');
const User = require('../models/User');

module.exports = {
  async show(req, res) {
    const isSqlite = sequelize.getDialect && sequelize.getDialect() === 'sqlite';
    const users = await User.findAll({
      attributes: ['name', 'email'],
      where: {
        email: {
          [isSqlite ? Op.like : Op.iLike]: isSqlite ? '%@mail.com%' : '%@mail.com',
        },
      },
      include: [
        {
          association: 'addresses',
          where: {
            street: 'Regent Street',
          },
        },
        {
          association: 'techs',
          required: false,
          where: {
            name: {
              [isSqlite ? Op.like : Op.iLike]: isSqlite ? 'React%' : 'React%',
            },
          },
        },
      ],
    });

    return res.json(users);
  },
};
