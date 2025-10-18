module.exports = {
  development: {
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
  },
  production: {
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USER || 'docker',
    password: process.env.DB_PASS || 'docker',
    database: process.env.DB_NAME || 'sqlnode',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
  },
};
