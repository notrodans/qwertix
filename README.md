# Qwertix ⌨️

> [!CAUTION]
> This is a **pet project** currently under active development. Expect **numerous bugs**, unfinished features, and occasional breaking changes.

A multiplayer typing competition platform built with real-time features.

## 🚀 Features

- **Real-time Racing:** Compete with friends in real-time.
- **Doppler Integration:** Centralized secrets management.
- **Modern Stack:** Built with Bun, React, and Fastify.

## 🛠 Tech Stack

- **Monorepo:** Bun Workspaces
- **Frontend:** React, Vite, Reatom (v1000), Zod, ESLint (FSD boundaries), Bun (sirv)
- **Backend:** Node.js, Fastify, WebSockets (`ws`), PostgreSQL + Drizzle ORM
- **Infrastructure:** Docker Swarm, Traefik (Let's Encrypt), Doppler (Secrets), Adminer
- **Tooling:** Biome (Linting & Formatting), Vitest (Unit/E2E), Playwright (Integration)

## 🚥 Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.1+)
- [Docker](https://www.docker.com/) (v24+)
- [Doppler CLI](https://docs.doppler.com/docs/install-cli)

### 🐳 Deployment (Production / Swarm)

This project uses **Docker Swarm** with **Traefik** for automatic SSL (Let's Encrypt) and **Doppler** for secrets management.

For detailed instructions, see [PRODUCTION.md](PRODUCTION.md).

**Quick Start:**

1.  Initialize Swarm: `docker swarm init`
2.  Start local registry: `docker compose -f docker-compose.stack.local.yml up -d registry`
3.  Create Doppler secret: `echo "your_token" | docker secret create doppler_token -`
4.  (Optional) Clear old DB data if migrating from Postgres < 18: `docker volume rm qwertix_data`
5.  Build, Push & Deploy:
    ```bash
    docker compose -f docker-compose.stack.local.yml build
    docker compose -f docker-compose.stack.local.yml push
    docker stack deploy -c docker-compose.stack.local.yml qwertix
    ```

### 🛠️ Local Development (No Swarm)

1.  **Install dependencies**:
    ```bash
    bun install
    ```

2.  **Setup Doppler**:
    ```bash
    doppler setup
    ```

3.  **Start the dev services** (DB, Adminer):
    ```bash
    docker compose -f docker-compose.dev.yml up -d
    ```

4.  **Start both frontend and backend**:
    ```bash
    bun run dev
    ```

*   **Frontend**: http://localhost:3006
*   **Backend API**: http://localhost:3009
*   **Adminer**: http://localhost:8085

## 📜 License

MIT
