# Qwertix

A high-performance, social typing competition platform (Monkeytype clone) built for **Agent-Driven Development (ADD)** with a modern full-stack TypeScript environment.

> [!CAUTION]
> This is a **pet project** currently under active development. Expect **numerous bugs**, unfinished features, and occasional breaking changes.

## Features

- **Real-time Racing**: Compete with friends in real-time using WebSockets (`ws`).
- **Feature-Sliced Design**: Scalable frontend architecture using FSD methodology.
- **Dependency Injection**: Clean backend architecture with `awilix`.
- **Modern Tooling**: Bun, Biome, ESLint, Vitest, Playwright, Drizzle ORM.
- **Infrastructure**: Docker Swarm ready, centralized secrets with Doppler.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.1+) (JavaScript runtime & package manager)
- [Docker](https://www.docker.com/) (v24+) (for Database & Swarm)
- [Doppler CLI](https://docs.doppler.com/docs/install-cli) (Secrets management)

### Installation

1.  **Install dependencies**:
    ```bash
    bun install
    ```

2.  **Setup Doppler** (Required for environment variables):
    ```bash
    doppler setup
    ```

### Running Local Development

1.  **Start Infrastructure** (PostgreSQL, Adminer):
    ```bash
    docker compose -f docker-compose.dev.yml up -d
    ```

2.  **Start Application** (Frontend + Backend):
    ```bash
    bun run dev
    ```
    - **Frontend**: http://localhost:3006
    - **Backend API**: http://localhost:3009
    - **Adminer**: http://localhost:8085

### Linting & Formatting

```bash
# Run all linters and formatters (Biome + ESLint)
bun run lint:fix

# Check formatting without fixing
bun run lint
```

## Workspace Structure

```text
qwertix/
├── .github/           # GitHub Actions & Agent Guidelines
├── .husky/            # Git hooks (pre-commit)
├── apps/              # Application workspaces
│   ├── backend/       # Fastify + WebSocket API
│   └── frontend/      # React + Vite (FSD)
├── docs/              # Documentation & User Stories
├── libs/              # Shared libraries
│   ├── room-contracts/# Shared types & interfaces
│   └── tsconfig/      # Base TypeScript configs
├── specifications/    # Feature specifications (SDD)
├── docker-compose.*   # Docker orchestration files
├── package.json       # Monorepo configuration
└── README.md          # This file
```

## Available Scripts

| Script                               | Description                                       |
| ------------------------------------ | ------------------------------------------------- |
| `bun run dev`                        | Start both frontend and backend in watch mode     |
| `bun run build`                      | Build all workspaces for production               |
| `bun run lint`                       | Check code style and quality (Biome + ESLint)     |
| `bun run lint:fix`                   | Auto-fix code style and quality issues            |
| `bun run test`                       | Run unit tests (Vitest)                           |
| `bun run test:e2e`                   | Run end-to-end tests (Playwright)                 |
| `bun run db:generate`                | Generate SQL migrations from Drizzle schema       |
| `bun run db:migrate`                 | Apply SQL migrations to the database              |

## Testing

Run tests for specific layers or workspaces:

```bash
# Unit Tests (Vitest)
bun run test

# E2E Tests (Playwright - Frontend)
bun run --filter frontend test:e2e

# E2E Tests (Vitest + Supertest - Backend)
bun run --filter backend test:e2e
```

## Configuration Files

- **`package.json`** – Bun workspaces, scripts, dev dependencies
- **`biome.json`** – Biome configuration (Formatting/Linting)
- **`eslint.config.mjs`** – ESLint flat config (FSD boundaries, React rules)
- **`tsconfig.json`** – TypeScript compiler options (Base)
- **`cliff.toml`** – Git Cliff changelog configuration
- **`doppler.yaml`** – Doppler secrets configuration

## Deployment (Production / Swarm)

This project uses **Docker Swarm** with **Traefik** for automatic SSL. See [PRODUCTION.md](PRODUCTION.md) for detailed deployment instructions.

## License

MIT – see [LICENSE](LICENSE) (if present).