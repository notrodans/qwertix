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
- [Docker](https://www.docker.com/)

### Installation

```bash
bun install --frozen-lockfile
```

### Development

```bash
# Start the database
docker-compose -f docker-compose.dev.yml up -d

# Start both frontend and backend
bun run dev
```

### Database Management

```bash
cd apps/backend
bun run db:generate  # Generate migrations
bun run db:push      # Push schema to DB
```

## 📜 License

MIT
