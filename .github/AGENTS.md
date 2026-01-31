# Agent Guide

## Agent Rules

- **NEVER ignore linting rules**: Always address lint warnings and errors. Use `bun run lint:fix` to automatically fix issues where possible, and manually resolve any remaining violations before committing code.
- **Spec-Driven Development (SDD)**: Before implementing any feature, ALWAYS check or create a user story in `docs/user-stories/`.

## Build/Lint/Test Commands

The repository uses Bun for all scripts.

### Core Commands

```bash
bun run dev                  # Start frontend and backend in watch mode
bun run build                # Build all workspaces
bun run lint                 # Run Biome + ESLint checks
bun run lint:fix             # Apply automatic fixes
bun run test                 # Run unit tests (Vitest)
bun run test:e2e             # Run E2E tests (Playwright)
```

### Database Commands

```bash
bun run db:generate          # Generate SQL migrations from Drizzle schema
bun run db:migrate           # Apply migrations to the database
```

### Pre-commit Hooks

The repository uses Husky with lint-staged to run checks on staged files before commits. The pre-commit hook runs `lint:fix` logic.

## Code Style Guidelines

### TypeScript/JavaScript (Frontend & Backend)

- **Strictness**: `noImplicitAny`, `strictNullChecks` enabled.
- **Imports**:
    - Use ES modules (`import/export`).
    - **Frontend (FSD)**: Respect FSD boundaries. Lower layers cannot import from upper layers. Public API via `index.ts`.
    - **Backend**: Use dependency injection patterns, avoid global side-effects.
- **Naming Conventions**:
    - Variables/Functions: `camelCase`
    - Components/Classes/Types: `PascalCase`
    - Constants: `UPPER_SNAKE_CASE`
    - Boolean variables: Prefix with `is`, `has`, `should` (e.g., `isValid`).
- **Async/Await**: Prefer `async/await` over raw promises.
- **Error Handling**: Use `try/catch` blocks. On backend, let errors bubble up to the global error handler unless specific recovery is needed.
- **Comments**: Use JSDoc for public APIs. Prefer self-documenting code over excessive comments.

### React (Frontend)

- **Components**: Functional components only.
- **Hooks**:
    - Call hooks at the top level.
    - Custom hooks for complex logic (separation of concerns).
    - **Avoid `useEffect` for logic**: Use event handlers and derived state.
- **State**:
    - **Server State**: TanStack Query.
    - **Global Client State**: Zustand (mostly for UI state).
    - **Local State**: `useState` / `useReducer`.

### Backend (Node.js/Fastify)

- **Architecture**: Controller -> Service -> Repository.
- **Dependency Injection**: Use `awilix`. Classes should accept dependencies via constructor.
- **Validation**: Zod for all inputs (HTTP & WebSocket).
- **Database**: Drizzle ORM.
    - Schema-first approach.
    - Use repositories for DB access.

## Tooling Configuration

### Monorepo Structure

- **`apps/frontend`**: React application (FSD).
- **`apps/backend`**: Fastify server.
- **`libs/*`**: Shared libraries (contracts, configs).

### Linting & Formatting

- **Biome**: Primary formatter and linter for speed.
- **ESLint**: Used specifically for Feature-Sliced Design (FSD) boundary checks and React-specific rules that Biome doesn't cover yet.

## Spec-Driven Development (SDD)

*   **Location**: `docs/user-stories/*.md`
*   **Workflow**:
    1.  Check if a user story exists.
    2.  If not, create one using the template.
    3.  Implement only after requirements are clear.

## Troubleshooting

- **Linting Errors**: Run `bun run lint:fix`. If FSD errors persist, check import paths (lower layers cannot import upper layers).
- **Database Issues**: Ensure Docker container is running (`docker compose up -d`) and migrations are applied (`bun run db:migrate`).
## Ralph Autonomous Agent

Ralph (`scripts/ralph/ralph.sh`) is an autonomous loop that runs AI coding tools (Amp, Claude, or OpenCode) repeatedly until all `prd.json` items are complete.

### Usage
```bash
./scripts/ralph/ralph.sh [max_iterations]             # Run with Amp (default)
./scripts/ralph/ralph.sh --tool claude [iterations]   # Run with Claude Code
./scripts/ralph/ralph.sh --tool opencode [iterations] # Run with OpenCode
```

### Key Files
- `prd.json`: Define the tasks/stories to be completed.
- `progress.txt`: Tracks completed items and iteration logs.
- `prompt.md` / `CLAUDE.md` / `OPENCODE.md`: Contextual instructions for each tool.

### Patterns
- Fresh instances are spawned each iteration with clean context.
- Persistence is managed via git history, `prd.json`, and `progress.txt`.
- Stories should be granular enough for single-context completion.
