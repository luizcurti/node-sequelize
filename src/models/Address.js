const { Model, DataTypes } = require('sequelize');

class Address extends Model {
  static init(sequelize) {
    super.init(
      {
        zipcode: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: { notEmpty: true },
        },
        street: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: { notEmpty: true },
        },
        number: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: { isInt: true, min: 1 },
        },
      },
      {
        sequelize,
        tableName: 'addresses',
      },
    );
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  }
}

module.exports = Address;
