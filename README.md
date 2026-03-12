# Node.js + Sequelize API

> API RESTful completa construída com Node.js, Express e Sequelize ORM. Suporte multi-banco (SQLite/PostgreSQL), testes com 100% de coverage e Docker.

[![Node.js](https://img.shields.io/badge/Node.js-v22.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5.x-blue.svg)](https://expressjs.com/)
[![Sequelize](https://img.shields.io/badge/Sequelize-v6.x-52B0E7.svg)](https://sequelize.org/)
[![Jest](https://img.shields.io/badge/Jest-v29.x-C21325.svg)](https://jestjs.io/)
[![Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen.svg)](#-testes)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## Sumário

- [Funcionalidades](#-funcionalidades)
- [Stack](#-stack)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Como rodar](#-como-rodar)
- [Configuração de banco](#-configuração-de-banco)
- [Rotas da API](#-rotas-da-api)
- [Testes](#-testes)
- [Lint](#-lint)
- [Docker](#-docker)
- [Modelos](#-modelos)
- [Licença](#-licença)

---

## ✨ Funcionalidades

- CRUD completo de **usuários**, **endereços** e **tecnologias**
- Relacionamentos ORM: `hasMany`, `belongsTo`, `belongsToMany`
- Validações de entrada (campos obrigatórios, email único, email inválido → 400/409)
- Tratamento de erros em todos os controllers (500 nunca vaza stack trace)
- Suporte a SQLite (dev/test) e PostgreSQL (produção)
- **118 testes** — unitários + integração via supertest — **100% de coverage**
- Lint com ESLint (Airbnb style guide)
- Docker Compose com healthcheck e serviço da aplicação

---

## 🛠️ Stack

| Camada | Tecnologia |
|--------|-----------|
| Runtime | Node.js 22.x |
| Framework | Express 5.x |
| ORM | Sequelize 6.x |
| Banco (dev/test) | SQLite 3 |
| Banco (prod) | PostgreSQL 14 |
| Testes | Jest 29 + Supertest |
| Lint | ESLint 8 (Airbnb) |
| Container | Docker + Docker Compose |

---

## 📁 Estrutura do projeto

```
node-sequelize/
├── src/
│   ├── controllers/
│   │   ├── UserController.js       # index, store, update, destroy
│   │   ├── AddressController.js    # index, store, update, destroy
│   │   ├── TechController.js       # index, store, delete
│   │   └── ReportController.js     # show
│   ├── models/
│   │   ├── User.js                 # validações + associações
│   │   ├── Address.js
│   │   └── Tech.js
│   ├── database/
│   │   ├── index.js                # conexão Sequelize
│   │   └── migrations/             # 4 migrations
│   ├── config/
│   │   └── database.js             # dev / test / production
│   ├── __tests__/
│   │   ├── controllers/            # testes unitários (mocks)
│   │   ├── models/                 # testes de model (SQLite in-memory)
│   │   └── integration/
│   │       └── routes.test.js      # testes de integração (supertest)
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

## 🚀 Como rodar

### Pré-requisitos

- Node.js 22.x ou superior
- npm
- Docker (opcional, para PostgreSQL)

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/luizcurti/node-sequelize.git
cd node-sequelize

# 2. Instale as dependências
npm install

# 3. Copie o .env (ajuste conforme necessário)
cp .env.example .env

# 4. Rode as migrations (cria o banco SQLite local)
npm run db:migrate

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

A API estará disponível em `http://localhost:3333`.

---

## 🗄️ Configuração de banco

O projeto usa `NODE_ENV` para selecionar o banco automaticamente via `src/config/database.js`.

| Ambiente | Banco | Storage |
|----------|-------|---------|
| `development` | SQLite | `./database.sqlite` |
| `test` | SQLite | `:memory:` (RAM) |
| `production` | PostgreSQL | via variáveis de ambiente |

### Variáveis de ambiente (produção)

Crie um arquivo `.env` baseado no `.env.example`:

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

## 📡 Rotas da API

> Base URL: `http://localhost:3333`
>
> Importe `api.collection.json` no Postman para usar todas as rotas prontas.

---

### Usuários

#### `GET /users`
Lista todos os usuários.

```bash
curl http://localhost:3333/users
```

**Resposta 200:**
```json
[
  { "id": 1, "name": "Alice", "email": "alice@example.com", "created_at": "...", "updated_at": "..." }
]
```

---

#### `POST /users`
Cria um novo usuário.

**Body (JSON):**
```json
{ "name": "Alice Silva", "email": "alice@example.com" }
```

```bash
curl -X POST http://localhost:3333/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice Silva", "email": "alice@example.com"}'
```

| Status | Situação |
|--------|----------|
| `201` | Usuário criado |
| `400` | `name` ou `email` ausentes |
| `409` | Email já cadastrado |

---

#### `PUT /users/:id`
Atualiza `name` e/ou `email` de um usuário.

**Body (JSON):**
```json
{ "name": "Alice Costa", "email": "alice.nova@example.com" }
```

```bash
curl -X PUT http://localhost:3333/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice Costa"}'
```

| Status | Situação |
|--------|----------|
| `200` | Usuário atualizado |
| `404` | Usuário não encontrado |
| `409` | Novo email já em uso |

---

#### `DELETE /users/:id`
Remove um usuário. Endereços vinculados são excluídos em cascata.

```bash
curl -X DELETE http://localhost:3333/users/1
```

| Status | Situação |
|--------|----------|
| `204` | Removido (sem corpo) |
| `404` | Usuário não encontrado |

---

### Endereços

#### `GET /users/:user_id/addresses`
Lista endereços de um usuário.

```bash
curl http://localhost:3333/users/1/addresses
```

**Resposta 200:**
```json
[
  { "id": 1, "zipcode": "01001-000", "street": "Avenida Paulista", "number": 1000, "user_id": 1, "created_at": "...", "updated_at": "..." }
]
```

---

#### `POST /users/:user_id/addresses`
Cria endereço vinculado ao usuário.

**Body (JSON):**
```json
{ "zipcode": "01001-000", "street": "Avenida Paulista", "number": 1000 }
```

```bash
curl -X POST http://localhost:3333/users/1/addresses \
  -H "Content-Type: application/json" \
  -d '{"zipcode": "01001-000", "street": "Avenida Paulista", "number": 1000}'
```

| Status | Situação |
|--------|----------|
| `201` | Endereço criado |
| `400` | `zipcode`, `street` ou `number` ausentes |
| `404` | Usuário não encontrado |

---

#### `PUT /users/:user_id/addresses/:address_id`
Atualiza um endereço (garantindo que pertence ao usuário).

**Body (JSON):**
```json
{ "zipcode": "04538-132", "street": "Rua Olimpíadas", "number": 360 }
```

```bash
curl -X PUT http://localhost:3333/users/1/addresses/2 \
  -H "Content-Type: application/json" \
  -d '{"street": "Rua Nova"}'
```

| Status | Situação |
|--------|----------|
| `200` | Endereço atualizado |
| `404` | Usuário ou endereço não encontrado |

---

#### `DELETE /users/:user_id/addresses/:address_id`
Remove um endereço.

```bash
curl -X DELETE http://localhost:3333/users/1/addresses/2
```

| Status | Situação |
|--------|----------|
| `204` | Removido (sem corpo) |
| `404` | Usuário ou endereço não encontrado |

---

### Tecnologias

#### `GET /users/:user_id/techs`
Lista techs do usuário (apenas o campo `name`).

```bash
curl http://localhost:3333/users/1/techs
```

**Resposta 200:**
```json
[{ "name": "React" }, { "name": "Node.js" }]
```

---

#### `POST /users/:user_id/techs`
Adiciona uma tech ao usuário. Se a tech não existir, é criada automaticamente (`findOrCreate`).

**Body (JSON):**
```json
{ "name": "React" }
```

```bash
curl -X POST http://localhost:3333/users/1/techs \
  -H "Content-Type: application/json" \
  -d '{"name": "React"}'
```

| Status | Situação |
|--------|----------|
| `201` | Tech associada |
| `400` | `name` ausente |
| `404` | Usuário não encontrado |

---

#### `DELETE /users/:user_id/techs?name=<nome>`
Remove a associação usuário-tech. A tech permanece na tabela `techs`.

> ⚠️ O nome da tech é passado como **query param**, não no body.

```bash
curl -X DELETE "http://localhost:3333/users/1/techs?name=React"
```

| Status | Situação |
|--------|----------|
| `204` | Associação removida (sem corpo) |
| `400` | Query param `name` ausente |
| `404` | Usuário ou tech não encontrado |

---

### Relatório

#### `GET /report`
Retorna usuários que atendem **todos** os critérios simultaneamente:
- Email contém `@mail.com`
- Possui endereço na rua `Regent Street`
- Techs com nome começando em `React` (campo opcional — não exclui o usuário se não tiver)

Retorna apenas os campos `name`, `email`, `addresses` e `techs`.

```bash
curl http://localhost:3333/report
```

**Resposta 200:**
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

### Resumo de rotas

| Método | Rota | Status sucesso |
|--------|------|---------------|
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

## 🧪 Testes

### Executar

```bash
# Todos os testes
npm test

# Com relatório de coverage
npm run test:coverage

# Modo watch (desenvolvimento)
npm run test:watch

# Suite específica
npm test -- UserController
npm test -- integration
```

### Resultado atual

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

### Estratégia de testes

| Camada | Tipo | Ferramenta |
|--------|------|-----------|
| Controllers | Unitário (jest.mock dos models) | Jest |
| Models | Real SQLite in-memory | Jest + Sequelize |
| Rotas | Integração (stack completa) | Supertest + SQLite in-memory |

---

## ⚙️ Lint

```bash
# Verificar
npm run lint

# Corrigir automaticamente
npm run lint:fix
```

Configuração: ESLint 8 com `eslint-config-airbnb-base`. Regras em `.eslintrc.json`.

---

## 🐳 Docker

### Subir apenas o banco (PostgreSQL)

```bash
docker-compose up -d db
export NODE_ENV=production
npm run db:migrate
npm start
```

### Subir aplicação + banco completo

```bash
docker-compose up -d
```

O serviço `app` aguarda o banco ficar saudável antes de iniciar (`depends_on` com `healthcheck`).

### Variáveis no `docker-compose.yml`

São lidas do `.env` automaticamente. Exemplo:

```bash
DB_NAME=sqlnode
DB_USER=docker
DB_PASS=docker
PORT=3333
```

---

## 📦 Scripts disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Servidor com hot-reload (nodemon) |
| `npm start` | Servidor de produção |
| `npm test` | Todos os testes |
| `npm run test:watch` | Testes em modo watch |
| `npm run test:coverage` | Testes + relatório de coverage |
| `npm run lint` | Verificar lint |
| `npm run lint:fix` | Corrigir lint automaticamente |
| `npm run db:create` | Criar banco |
| `npm run db:migrate` | Rodar migrations |
| `npm run db:migrate:undo` | Reverter última migration |

---

## 📋 Modelos

### User

| Campo | Tipo | Constraint |
|-------|------|-----------|
| `id` | INTEGER | PK, AUTO INCREMENT |
| `name` | STRING | NOT NULL |
| `email` | STRING | NOT NULL, UNIQUE, isEmail |
| `created_at` | DATE | NOT NULL |
| `updated_at` | DATE | NOT NULL |

Relacionamentos: `hasMany Address`, `belongsToMany Tech` (through `user_techs`)

### Address

| Campo | Tipo | Constraint |
|-------|------|-----------|
| `id` | INTEGER | PK, AUTO INCREMENT |
| `user_id` | INTEGER | FK → users.id (CASCADE) |
| `zipcode` | STRING | NOT NULL |
| `street` | STRING | NOT NULL |
| `number` | INTEGER | NOT NULL |

Relacionamentos: `belongsTo User`

### Tech

| Campo | Tipo | Constraint |
|-------|------|-----------|
| `id` | INTEGER | PK, AUTO INCREMENT |
| `name` | STRING | NOT NULL, UNIQUE |

Relacionamentos: `belongsToMany User` (through `user_techs`)

---

## 📄 Licença

MIT — veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**Luiz Curti** — [@luizcurti](https://github.com/luizcurti)
