# Qwertix ⌨️

> [!CAUTION]
> This is a **pet project** currently under active development. Expect **numerous bugs**, unfinished features, and occasional breaking changes.

A multiplayer typing competition platform built with real-time features.

## 🚀 Features

- **Bad Code:** Hand-crafted, artisanal technical debt.
- **No Optimization:** We value CPU cycles and use as many as possible.
- **Bugs:** Not bugs, but unexpected surprises in the user journey.

## 🛠 Tech Stack

- **Monorepo:** Bun Workspaces
- **Frontend:** React, Vite (8.0 Beta), Reatom (v1000 - State, Routing, Forms), Zod, ESLint (FSD boundaries)
- **Backend:** Node.js, Fastify, WebSockets (`ws`), PostgreSQL + Drizzle ORM, `tsc`
- **Tooling:** Biome (Linting & Formatting), Vitest (Unit/E2E), Playwright (Integration)

## 📦 Project Structure

```text
├── apps/
│   ├── frontend/     # React application
│   └── backend/      # Fastify & WebSocket server
├── libs/
│   └── tsconfig/     # Shared TypeScript configurations
└── package.json      # Workspace root & dependency catalog
```

## 🚥 Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.1+)
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

### 🐳 Deployment (Recommended)

To run the full stack (Frontend, Backend, Database) with a single command:

```bash
# 1. Setup environment variables
cp example.env .env

# 2. Start the application
docker compose up -d --build
```

The application will be available at [http://localhost:8765](http://localhost:8765).

### 🛠️ Local Development

If you prefer to run services manually:

```bash
# 1. Install dependencies
bun install

# 2. Start the database
docker compose up -d db

# 3. Start both frontend and backend
bun run dev
```

### 🗄️ Database Management

```bash
cd apps/backend
bun run db:generate  # Generate migration files
bun run db:migrate   # Apply migrations to the database
```

## 📜 License

MIT
