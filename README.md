# Node.js + Sequelize API

> A complete RESTful API built with Node.js, Express, and Sequelize ORM featuring multi-database support (SQLite/PostgreSQL), comprehensive testing, and Docker integration.

[![CI](https://github.com/luizcurti/node-sequelize/actions/workflows/ci.yml/badge.svg)](https://github.com/luizcurti/node-sequelize/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/Node.js-v22.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5.x-blue.svg)](https://expressjs.com/)
[![Sequelize](https://img.shields.io/badge/Sequelize-v6.x-52B0E7.svg)](https://sequelize.org/)
[![Jest](https://img.shields.io/badge/Jest-v29.x-C21325.svg)](https://jestjs.io/)
[![Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen.svg)](./TESTS.md)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Database Configuration](#-database-configuration)
- [API Endpoints](#-api-endpoints)
- [Testing](#-testing)
- [Code Quality](#-code-quality)
- [Docker Support](#-docker-support)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- 🚀 **RESTful API** with Express.js
- 🗄️ **Multi-database support** (SQLite for development, PostgreSQL for production)
- 🔄 **Database migrations** with Sequelize CLI
- 🧪 **100% test coverage** on controllers and models (68 unit tests)
- 🎯 **Association handling** (One-to-Many, Many-to-Many)
- 🐳 **Docker support** with PostgreSQL
- 📝 **Code linting** with ESLint (Airbnb style guide)
- 🔍 **Advanced queries** with reports and filters
- 📦 **In-memory testing** for fast test execution
- 🛠️ **Easy migration management**
- ⚙️ **CI/CD** with GitHub Actions

## 🛠️ Tech Stack

- **Runtime**: Node.js v22.x+
- **Framework**: Express v5.x
- **ORM**: Sequelize v6.x
- **Databases**: SQLite (dev), PostgreSQL (prod)
- **Testing**: Jest v29.x
- **Linting**: ESLint v8.x (Airbnb config)
- **DevOps**: Docker & Docker Compose
- **CI/CD**: GitHub Actions

## 📁 Project Structure

```
node-sequelize/
├── src/
│   ├── controllers/          # Request handlers
│   │   ├── UserController.js
│   │   ├── AddressController.js
│   │   ├── TechController.js
│   │   └── ReportController.js
│   ├── models/               # Sequelize models
│   │   ├── User.js
│   │   ├── Address.js
│   │   └── Tech.js
│   ├── database/
│   │   ├── index.js          # Database connection
│   │   └── migrations/       # Database migrations
│   ├── config/
│   │   └── database.js       # Database configuration
│   ├── __tests__/            # Test files
│   │   ├── controllers/      # Controller tests
│   │   └── models/           # Model tests
│   ├── app.js                # Express configuration
│   ├── routes.js             # API routes
│   └── server.js             # Server entry point
├── .github/
│   └── workflows/
│       └── ci.yml            # GitHub Actions CI
├── docker-compose.yml        # PostgreSQL container
├── jest.config.js            # Jest configuration
├── .eslintrc.json            # ESLint rules
└── package.json              # Dependencies & scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 22.x or higher
- npm or yarn
- Docker (optional, for PostgreSQL)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/luizcurti/node-sequelize.git
   cd node-sequelize
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3333`

## 🗄️ Database Configuration

The project supports multiple database configurations:

### Development (SQLite)
- **Location**: `./database.sqlite`
- **Pros**: No setup required, portable
- **Cons**: Limited for production use

### Test (SQLite In-Memory)
- **Location**: RAM (`:memory:`)
- **Pros**: Fast test execution, no file cleanup needed
- **Cons**: Data lost after tests

### Production (PostgreSQL)
- **Location**: Docker container or remote server
- **Configuration**: Via environment variables

#### Environment Variables

Create a `.env` file (optional) or export these variables:

```bash
NODE_ENV=production
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sqlnode
DB_USER=docker
DB_PASS=docker
```

## 📡 API Endpoints

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/users` | List all users |
| POST   | `/users` | Create a new user |

**Example Request:**
```bash
curl -X POST http://localhost:3333/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

### Addresses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/users/:user_id/addresses` | List user addresses |
| POST   | `/users/:user_id/addresses` | Add address to user |

**Example Request:**
```bash
curl -X POST http://localhost:3333/users/1/addresses \
  -H "Content-Type: application/json" \
  -d '{"zipcode": "12345", "street": "Main St", "number": 123}'
```

### Technologies

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/users/:user_id/techs` | List user technologies |
| POST   | `/users/:user_id/techs` | Add technology to user |
| DELETE | `/users/:user_id/techs` | Remove technology from user |

**Example Request:**
```bash
curl -X POST http://localhost:3333/users/1/techs \
  -H "Content-Type: application/json" \
  -d '{"name": "Node.js"}'
```

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/report` | Get filtered user report |

**Description**: Returns users with emails containing "@mail.com", addresses on "Regent Street", and technologies starting with "React".

### 📮 API Collection

Import the `api.collection.json` file into Postman or Insomnia for ready-to-use requests.

## 🧪 Testing

The project includes comprehensive unit tests with **100% coverage** on controllers and models.

### Run Tests

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run in watch mode
npm test -- --watch

# Run specific test file
npm test -- UserController
```

### Test Results

```
Test Suites: 7 passed, 7 total
Tests:       68 passed, 68 total
Coverage:    100% (controllers & models)
Time:        ~1 second
```

### Coverage Report

```
--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files           |     100 |      100 |     100 |     100 |
 controllers        |     100 |      100 |     100 |     100 |
 models             |     100 |      100 |     100 |     100 |
--------------------|---------|----------|---------|---------|
```

See [TESTS.md](./TESTS.md) for detailed test documentation.

## ⚙️ CI/CD

This project uses **GitHub Actions** for continuous integration. On every push or pull request to the `main` branch, the following checks are executed:

### CI Pipeline Steps

1. ✅ **Code Checkout** - Clone the repository
2. ✅ **Node.js Setup** - Install Node.js 22.x
3. ✅ **Dependencies** - Install npm packages
4. ✅ **Linting** - Run ESLint checks
5. ✅ **Unit Tests** - Execute all 68 tests
6. ✅ **Coverage** - Generate coverage report

### CI Configuration

The workflow is defined in `.github/workflows/ci.yml`:

```yaml
name: CI
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
```

### CI Badge

Check the CI status at the top of this README or visit the [Actions tab](https://github.com/luizcurti/node-sequelize/actions).

## 🎨 Code Quality

### Linting

The project uses ESLint with Airbnb style guide:

```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm start` | Start production server |
| `npm test` | Run all tests |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Check code for linting errors |
| `npm run lint:fix` | Auto-fix linting errors |
| `npm run db:create` | Create database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:migrate:undo` | Rollback last migration |

## 🐳 Docker Support

### PostgreSQL with Docker Compose

1. **Start PostgreSQL container**
   ```bash
   docker-compose up -d
   ```

2. **Set environment to production**
   ```bash
   export NODE_ENV=production
   ```

3. **Run migrations**
   ```bash
   npm run db:migrate
   ```

4. **Start the server**
   ```bash
   npm start
   ```

### Docker Compose Configuration

```yaml
version: '3.8'
services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: sqlnode
      POSTGRES_USER: docker
      POSTGRES_PASSWORD: docker
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data
```

## 📚 Database Models

### User
- `id` (integer, primary key)
- `name` (string)
- `email` (string)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Relationships:**
- Has many Addresses
- Has many Technologies (through user_techs)

### Address
- `id` (integer, primary key)
- `zipcode` (string)
- `street` (string)
- `number` (integer)
- `user_id` (foreign key)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Relationships:**
- Belongs to User

### Tech
- `id` (integer, primary key)
- `name` (string)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Relationships:**
- Has many Users (through user_techs)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Guidelines

- Follow the existing code style (ESLint)
- Write tests for new features
- Update documentation as needed
- Keep commits atomic and descriptive

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Luiz Curti**
- GitHub: [@luizcurti](https://github.com/luizcurti)

## 🙏 Acknowledgments

- [Sequelize Documentation](https://sequelize.org/)
- [Express.js](https://expressjs.com/)
- [Jest Testing Framework](https://jestjs.io/)

---

⭐ If you find this project helpful, please give it a star!