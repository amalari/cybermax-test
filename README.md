# Achmad Cybermax Test

## Technologies

- **Nx Monorepo**: A powerful tool for managing monorepos. Learn more at [Nx](https://nx.dev).
- **Microservice Architecture**: Designed for scalability and separation of concerns.
- **Drizzle ORM**: A TypeScript ORM for PostgreSQL. Check out [Drizzle ORM](https://github.com/drizzle-team/drizzle-orm).
- **PostgreSQL**: An open-source relational database. Explore [PostgreSQL](https://www.postgresql.org).

## Prerequisites

- **Node.js 20**: This project requires Node.js version 20. Make sure you have it installed. You can download it from [Node.js](https://nodejs.org).

## How to Run

install dependency
```bash
   npm install
```
### With Docker

**Run Docker Compose**

   ```bash
   docker-compose up --build -d
   ```

### Without Docker
**Change .env to your database connection string**

  ```env
  DATABASE_URL=postgres://username:password@host:port/database
  ```

### Migration
**Run Migration**
  ```bash
  cd packages/database
  npm install #to make sure dev dependencies installed
  npx nx migrate database
  ```

### API
**Run API**
  ```bash
  npx nx serve api-gateway
  ```

### Swagger
**Open swagger to test it by default on [http](http://localhost:3000/api-docs)**