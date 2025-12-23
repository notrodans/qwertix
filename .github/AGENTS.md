# Project Development Guidelines for AI Assistants

This document outlines the core conventions, technologies, and patterns used in this project (**Qwertix**). Please adhere to these guidelines strictly to maintain code consistency and quality.

### **1. General Project Context**

*   **Goal:** Create a high-performance typing competition platform (Monkeytype clone) specifically designed for **real-time racing with friends**. The core focus is on social interaction, ease of joining races (invite links), and live competition feedback.
*   **Structure:** This is a monorepo managed via **Bun workspaces**.
    *   **`apps/frontend`**: The main web application (Feature-Sliced Design).
    *   **`apps/backend`**: The API and WebSocket server.
*   **Package Manager:** **Bun**. Use `bun install`, `bun add`, and `bun run`.
*   **Primary Technologies:**
    *   **Frontend:** React, Vite, TanStack Query, openapi-ts, Zod, **Feature-Sliced Design (FSD)**.
    *   **Backend:** Node.js, Express, WebSockets (`ws`), PostgreSQL (Raw SQL), Zod.
    *   **Tooling:** Biome (Linting/Formatting), ESLint (FSD Architecture checks).

---

### **2. Frontend Development (apps/frontend)**

#### **2.1. Architecture: Feature-Sliced Design (FSD)**

The frontend follows strict FSD principles. Layers are checked via ESLint boundaries.
*   **Layers:** `app` -> `pages` -> `widgets` -> `features` -> `entities` -> `shared`.
*   **Rules:**
    *   Lower layers cannot import from upper layers.
    *   Slices within the same layer (except `shared`) cannot cross-import.
    *   Use public API (`index.ts` or `pub/*`) for imports from other slices.

#### **2.2. Core Stack**

*   **Framework:** React (Latest) + Vite.
*   **State Management:** **TanStack Query** for server state. Global client state should be minimal.
*   **Validation:** **Zod**.
*   **Styling:** Tailwind CSS.

#### **2.3. Component Patterns**

*   **Functional Components:** Use function declarations.
*   **Props:** Define props with TypeScript interfaces.
*   **Hooks:** Extract complex logic into custom hooks.

---

### **3. Backend Development (apps/backend)**

#### **3.1. Core Stack**

*   **Runtime:** Node.js (executed via `tsx` in dev).
*   **Build Tool:** **tsc** (for ESM production bundles).
*   **Framework:** **Express.js**.
*   **Real-time:** Native **ws** library.
*   **Database:** **PostgreSQL**.
    *   **Query Builder:** **Drizzle ORM**.
    *   **Driver:** `pg` (node-postgres).
*   **Validation:** **Zod**.
*   **Testing:** **Vitest** (Unit & E2E via Supertest).

#### 3.2. Architecture

*   **Controllers:** Handle HTTP requests and WebSocket events.
*   **Services:** Contain business logic.
*   **Repositories:** Contain **Drizzle** queries.

**Repository Example (Drizzle):**

```typescript
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';

export const UserRepository = {
  async findById(id: number) {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }
};
```

### **4. Database & Migrations**

*   **Philosophy:** Schema-first (Drizzle schema).
*   **Migrations:** Managed via **Drizzle Kit**.
    *   Generate: `bun run db:generate`
    *   Migrate: `bun run db:migrate`

---

### **5. TypeScript Configuration**

*   **Structure:** Shared configuration located in `libs/tsconfig/base.json`.
*   **Usage:** All applications (`apps/*`) must extend the base configuration via `@qwertix/tsconfig/base.json`.
*   **Aliases:** Configured via `paths` in `tsconfig.json` and handled by `vite-tsconfig-paths` in Vite/Vitest. Standard alias: `@/*` -> `./src/*`.
*   **Strictness:** The base config is **strict** by default. Overrides should be minimal and justified.

---

### **6. Monorepo Workflow**
