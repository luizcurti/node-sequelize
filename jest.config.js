/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/database/migrations/**',
    '!src/database/index.js',
    '!src/config/database.js',
    '!src/app.js',
    '!src/routes.js',
    '!src/server.js',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
