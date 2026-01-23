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
- **Frontend:** React, Vite, Reatom (v1000), Zod, ESLint (FSD boundaries), Nginx
- **Backend:** Node.js, Fastify, WebSockets (`ws`), PostgreSQL + Drizzle ORM
- **Infrastructure:** Docker Swarm, Traefik, Doppler (Secrets), Adminer
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

### 🐳 Deployment (Production / Swarm)

This project uses **Docker Swarm** for production-like deployment with Traefik as a reverse proxy.

For detailed instructions, see [PRODUCTION.md](PRODUCTION.md).

**Quick Start (Local Swarm):**

1.  Initialize Swarm:
    ```bash
    docker swarm init
    ```

2.  Create secrets (dev values):
    ```bash
    echo "postgres" | docker secret create db_user -
    echo "postgres" | docker secret create db_password -
    echo "qwertix" | docker secret create db_name -
    echo "supersecret" | docker secret create jwt_secret -
    echo "default_salt" | docker secret create result_hash_salt -
    echo "" | docker secret create doppler_token -
    ```

3.  Build & Deploy:
    ```bash
    # Build images
    docker compose build

    # Deploy stack
    docker stack deploy -c docker-compose.yml qwertix
    ```

The application will be available at [http://localhost:3006](http://localhost:3006).

### 🛠️ Local Development (No Swarm)

For rapid development, use the dev-specific compose file and run apps locally.

```bash
# 1. Install dependencies
bun install

# 2. Setup environment variables
cp example.env .env

# 3. Start the dev services using dev config
docker compose -f docker-compose.dev.yml up -d

# 4. Start both frontend and backend
bun run dev
```

*   **Frontend**: http://localhost:3006
*   **Backend API**: http://localhost:3009
*   **Adminer**: http://localhost:8081

### 🗄️ Database Management

```bash
cd apps/backend
bun run db:generate  # Generate migration files
bun run db:migrate   # Apply migrations to the database
```

## 📜 License

MIT
