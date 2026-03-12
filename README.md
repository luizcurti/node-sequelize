# Node.js + Sequelize API

> A complete RESTful API built with Node.js, Express, and Sequelize ORM. Multi-database support (SQLite/PostgreSQL), 100% test coverage, and Docker.

[![Node.js](https://img.shields.io/badge/Node.js-v22.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5.x-blue.svg)](https://expressjs.com/)
[![Sequelize](https://img.shields.io/badge/Sequelize-v6.x-52B0E7.svg)](https://sequelize.org/)
[![Jest](https://img.shields.io/badge/Jest-v29.x-C21325.svg)](https://jestjs.io/)
[![Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen.svg)](#-tests)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## Table of Contents

- [Features](#-features)
- [Stack](#-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Database Configuration](#-database-configuration)
- [API Routes](#-api-routes)
- [Tests](#-tests)
- [Lint](#-lint)
- [Docker](#-docker)
- [Models](#-models)
- [License](#-license)

---

## ✨ Features

- Full CRUD for **users**, **addresses**, and **technologies**
- ORM relationships: `hasMany`, `belongsTo`, `belongsToMany`
- Input validation (required fields, unique email, invalid email → 400/409)
- Error handling in all controllers (500 never leaks stack traces)
- SQLite (dev/test) and PostgreSQL (production) support
- **118 tests** — unit + integration via supertest — **100% coverage**
- Lint with ESLint (Airbnb style guide)
- Docker Compose with healthcheck and app service

---

## 🛠️ Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 22.x |
| Framework | Express 5.x |
| ORM | Sequelize 6.x |
| Database (dev/test) | SQLite 3 |
| Database (prod) | PostgreSQL 14 |
| Tests | Jest 29 + Supertest |
| Lint | ESLint 8 (Airbnb) |
| Container | Docker + Docker Compose |

---

## 📁 Project Structure

```
node-sequelize/
├── src/
│   ├── controllers/
│   │   ├── UserController.js       # index, store, update, destroy
│   │   ├── AddressController.js    # index, store, update, destroy
│   │   ├── TechController.js       # index, store, delete
│   │   └── ReportController.js     # show
│   ├── models/
│   │   ├── User.js                 # validations + associations
│   │   ├── Address.js
│   │   └── Tech.js
│   ├── database/
│   │   ├── index.js                # Sequelize connection
│   │   └── migrations/             # 4 migrations
│   ├── config/
│   │   └── database.js             # dev / test / production
│   ├── __tests__/
│   │   ├── controllers/            # unit tests (mocks)
│   │   ├── models/                 # model tests (SQLite in-memory)
│   │   └── integration/
│   │       └── routes.test.js      # integration tests (supertest)
│   ├── app.js
│   ├── routes.js
│   └── server.js
├── api.collection.json             # Postman collection
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── jest.config.js
├── .eslintrc.json
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 22.x or higher
- npm
- Docker (optional, for PostgreSQL)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/luizcurti/node-sequelize.git
cd node-sequelize

# 2. Install dependencies
npm install

# 3. Copy the .env file (adjust as needed)
cp .env.example .env

# 4. Run migrations (creates the local SQLite database)
npm run db:migrate

# 5. Start the development server
npm run dev
```

The API will be available at `http://localhost:3333`.

---

## 🗄️ Database Configuration

The project uses `NODE_ENV` to automatically select the database via `src/config/database.js`.

| Environment | Database | Storage |
|-------------|----------|---------|
| `development` | SQLite | `./database.sqlite` |
| `test` | SQLite | `:memory:` (RAM) |
| `production` | PostgreSQL | via environment variables |

### Environment Variables (production)

Create a `.env` file based on `.env.example`:

```bash
NODE_ENV=production
PORT=3333
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sqlnode
DB_USER=docker
DB_PASS=docker
```

---

## 📡 API Routes

> Base URL: `http://localhost:3333`
>
> Import `api.collection.json` into Postman to use all routes ready-to-go.

---

### Users

#### `GET /users`
Returns all users.

```bash
curl http://localhost:3333/users
```

**Response 200:**
```json
[
  { "id": 1, "name": "Alice", "email": "alice@example.com", "created_at": "...", "updated_at": "..." }
]
```

---

#### `POST /users`
Creates a new user.

**Body (JSON):**
```json
{ "name": "Alice Smith", "email": "alice@example.com" }
```

```bash
curl -X POST http://localhost:3333/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice Smith", "email": "alice@example.com"}'
```

| Status | Situation |
|--------|-----------|
| `201` | User created |
| `400` | `name` or `email` missing |
| `409` | Email already registered |

---

#### `PUT /users/:id`
Updates a user's `name` and/or `email`.

**Body (JSON):**
```json
{ "name": "Alice Jones", "email": "alice.new@example.com" }
```

```bash
curl -X PUT http://localhost:3333/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice Jones"}'
```

| Status | Situation |
|--------|-----------|
| `200` | User updated |
| `404` | User not found |
| `409` | New email already in use |

---

#### `DELETE /users/:id`
Removes a user. Associated addresses are deleted in cascade.

```bash
curl -X DELETE http://localhost:3333/users/1
```

| Status | Situation |
|--------|-----------|
| `204` | Deleted (no body) |
| `404` | User not found |

---

### Addresses

#### `GET /users/:user_id/addresses`
Returns all addresses for a user.

```bash
curl http://localhost:3333/users/1/addresses
```

**Response 200:**
```json
[
  { "id": 1, "zipcode": "01001-000", "street": "Paulista Avenue", "number": 1000, "user_id": 1, "created_at": "...", "updated_at": "..." }
]
```

---

#### `POST /users/:user_id/addresses`
Creates an address linked to the user.

**Body (JSON):**
```json
{ "zipcode": "01001-000", "street": "Paulista Avenue", "number": 1000 }
```

```bash
curl -X POST http://localhost:3333/users/1/addresses \
  -H "Content-Type: application/json" \
  -d '{"zipcode": "01001-000", "street": "Paulista Avenue", "number": 1000}'
```

| Status | Situation |
|--------|-----------|
| `201` | Address created |
| `400` | `zipcode`, `street`, or `number` missing |
| `404` | User not found |

---

#### `PUT /users/:user_id/addresses/:address_id`
Updates an address (ensuring it belongs to the user).

**Body (JSON):**
```json
{ "zipcode": "04538-132", "street": "New Street", "number": 360 }
```

```bash
curl -X PUT http://localhost:3333/users/1/addresses/2 \
  -H "Content-Type: application/json" \
  -d '{"street": "New Street"}'
```

| Status | Situation |
|--------|-----------|
| `200` | Address updated |
| `404` | User or address not found |

---

#### `DELETE /users/:user_id/addresses/:address_id`
Removes an address.

```bash
curl -X DELETE http://localhost:3333/users/1/addresses/2
```

| Status | Situation |
|--------|-----------|
| `204` | Deleted (no body) |
| `404` | User or address not found |

---

### Technologies

#### `GET /users/:user_id/techs`
Returns the user's techs (only the `name` field).

```bash
curl http://localhost:3333/users/1/techs
```

**Response 200:**
```json
[{ "name": "React" }, { "name": "Node.js" }]
```

---

#### `POST /users/:user_id/techs`
Adds a tech to the user. If the tech does not exist, it is created automatically (`findOrCreate`).

**Body (JSON):**
```json
{ "name": "React" }
```

```bash
curl -X POST http://localhost:3333/users/1/techs \
  -H "Content-Type: application/json" \
  -d '{"name": "React"}'
```

| Status | Situation |
|--------|-----------|
| `201` | Tech associated |
| `400` | `name` missing |
| `404` | User not found |

---

#### `DELETE /users/:user_id/techs?name=<tech-name>`
Removes the user-tech association. The tech itself remains in the `techs` table.

> ⚠️ The tech name is passed as a **query param**, not in the request body.

```bash
curl -X DELETE "http://localhost:3333/users/1/techs?name=React"
```

| Status | Situation |
|--------|-----------|
| `204` | Association removed (no body) |
| `400` | Query param `name` missing |
| `404` | User or tech not found |

---

### Report

#### `GET /report`
Returns users matching **all** criteria simultaneously:
- Email contains `@mail.com`
- Has an address on `Regent Street`
- Has techs with a name starting with `React` (optional field — does not exclude the user if absent)

Returns only `name`, `email`, `addresses`, and `techs` fields.

```bash
curl http://localhost:3333/report
```

**Response 200:**
```json
[
  {
    "name": "John Doe",
    "email": "john@mail.com",
    "addresses": [{ "id": 1, "street": "Regent Street", "zipcode": "12345", "number": 10, "user_id": 1, "created_at": "...", "updated_at": "..." }],
    "techs": [{ "name": "React" }]
  }
]
```

---

### Routes Summary

| Method | Route | Success Status |
|--------|-------|---------------|
| `GET` | `/users` | 200 |
| `POST` | `/users` | 201 |
| `PUT` | `/users/:id` | 200 |
| `DELETE` | `/users/:id` | 204 |
| `GET` | `/users/:user_id/addresses` | 200 |
| `POST` | `/users/:user_id/addresses` | 201 |
| `PUT` | `/users/:user_id/addresses/:address_id` | 200 |
| `DELETE` | `/users/:user_id/addresses/:address_id` | 204 |
| `GET` | `/users/:user_id/techs` | 200 |
| `POST` | `/users/:user_id/techs` | 201 |
| `DELETE` | `/users/:user_id/techs?name=` | 204 |
| `GET` | `/report` | 200 |

---

## 🧪 Tests

### Running

```bash
# All tests
npm test

# With coverage report
npm run test:coverage

# Watch mode (development)
npm run test:watch

# Specific suite
npm test -- UserController
npm test -- integration
```

### Current Results

```
Test Suites: 8 passed, 8 total
Tests:       118 passed, 118 total
Snapshots:   0 total
Time:        ~1.4s
```

### Coverage

```
-----------------------|---------|----------|---------|---------|
File                   | % Stmts | % Branch | % Funcs | % Lines |
-----------------------|---------|----------|---------|---------|
All files              |     100 |      100 |     100 |     100 |
 src/app.js            |     100 |      100 |     100 |     100 |
 src/routes.js         |     100 |      100 |     100 |     100 |
 src/controllers/...   |     100 |      100 |     100 |     100 |
 src/models/...        |     100 |      100 |     100 |     100 |
-----------------------|---------|----------|---------|---------|
```

### Test Strategy

| Layer | Type | Tool |
|-------|------|------|
| Controllers | Unit (jest.mock models) | Jest |
| Models | Real SQLite in-memory | Jest + Sequelize |
| Routes | Integration (full stack) | Supertest + SQLite in-memory |

---

## ⚙️ Lint

```bash
# Check
npm run lint

# Auto-fix
npm run lint:fix
```

Configuration: ESLint 8 with `eslint-config-airbnb-base`. Rules defined in `.eslintrc.json`.

---

## 🐳 Docker

### Start database only (PostgreSQL)

```bash
docker-compose up -d db
export NODE_ENV=production
npm run db:migrate
npm start
```

### Start full stack (app + database)

```bash
docker-compose up -d
```

The `app` service waits for the database to be healthy before starting (`depends_on` with `healthcheck`).

### Variables in `docker-compose.yml`

Read from `.env` automatically. Example:

```bash
DB_NAME=sqlnode
DB_USER=docker
DB_PASS=docker
PORT=3333
```

---

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server with hot-reload (nodemon) |
| `npm start` | Production server |
| `npm test` | Run all tests |
| `npm run test:watch` | Tests in watch mode |
| `npm run test:coverage` | Tests + coverage report |
| `npm run lint` | Check lint |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run db:create` | Create database |
| `npm run db:migrate` | Run migrations |
| `npm run db:migrate:undo` | Revert last migration |

---

## 📋 Models

### User

| Field | Type | Constraint |
|-------|------|-----------|
| `id` | INTEGER | PK, AUTO INCREMENT |
| `name` | STRING | NOT NULL |
| `email` | STRING | NOT NULL, UNIQUE, isEmail |
| `created_at` | DATE | NOT NULL |
| `updated_at` | DATE | NOT NULL |

Relationships: `hasMany Address`, `belongsToMany Tech` (through `user_techs`)

### Address

| Field | Type | Constraint |
|-------|------|-----------|
| `id` | INTEGER | PK, AUTO INCREMENT |
| `user_id` | INTEGER | FK → users.id (CASCADE) |
| `zipcode` | STRING | NOT NULL |
| `street` | STRING | NOT NULL |
| `number` | INTEGER | NOT NULL |

Relationships: `belongsTo User`

### Tech

| Field | Type | Constraint |
|-------|------|-----------|
| `id` | INTEGER | PK, AUTO INCREMENT |
| `name` | STRING | NOT NULL, UNIQUE |

Relationships: `belongsToMany User` (through `user_techs`)

---

## 📄 License

MIT — see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Luiz Curti** — [@luizcurti](https://github.com/luizcurti)
