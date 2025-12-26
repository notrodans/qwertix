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

The frontend follows strict FSD principles with a **specific custom adaptation**. Layers are checked via ESLint boundaries.

*   **Layers:** `app` -> `pages` -> `widgets` -> `features` -> `entities` -> `shared`.
*   **General Rules:**
    *   Lower layers cannot import from upper layers.
    *   Slices within the same layer (except `shared`) cannot cross-import.
    *   **Public API:** Exports must be done via `pub/index.ts`
    *   **Internal Imports:** Do NOT use aliases (e.g., `@/features/...`) for imports within the same slice. Use relative paths.

**Specific Guidelines:**

1.  **Feature-First Approach:** Always start implementation from the `features` layer.
2.  **Feature Managers:** Instead of atomic features for every action, create "Feature Managers" (e.g., `presets-panel`). This single slice handles the model and UI for multiple related actions (create, edit, delete, etc.). This consolidation achieves **low coupling** between different features and **high cohesion** within the feature itself.
3.  **Segment Structure:**
    *   **`ui`**: Presentation components.
    *   **`model`**: Business logic, state management, and data representation (separated from UI).
    *   **`compose`**: Mediators implementing the Dependency Inversion Principle (DIP).
    *   **`domain`**: Pure domain logic (calculations, transformations, mapping).
4.  **Composition (DIP):** Use "Layout" or "Mediator" components that accept dependencies (slots) as props, rather than importing them directly.

**Example Structure (`preset-panel`):**

```text
preset-panel/
├── index.ts                  # Public API
├── model/
│   └── use-edit-preset.ts    # Logic (create, remove, delete, update) — can separate
├── compose
│   └── preset-panel-layout.tsx  # Mediator Component
└── ui/
    ├── preset-panel-header.tsx
    ├── edit/
    │   └── ...
    └── tables/
        └── ...
```

**Mediator Example:**

```tsx
// features/preset-panel/ui/preset-panel-layout.tsx
export function PresetPanelLayout({
    header,
    stats,
    messages,
}: {
    header: React.ReactNode;
    stats: React.ReactNode;
    messages: React.ReactNode;
}) {
    return (
        <div className="container mx-auto space-y-6 py-6">
            {header}
            {stats}
            {messages}
        </div>
    );
}
```

**Usage Example (Page Layer):**

```tsx
// pages/preset-page/ui/preset-page.tsx
import { useGetPreset } from '@/entities/preset';
import { PresetPanelLayout, PresetPanelHeader, ... } from '@/features/preset-panel';

function PresetPage() {
    const { data: preset } = useGetPreset();

    return (
        <PresetPanelLayout
            header={<PresetPanelHeader name={preset.name} />}
            stats={<PresetPanelStats ... />}
            messages={<PresetPanelMessages ... />}
        />
    );
}
```

#### **2.2. Core Stack**

*   **Framework:** React (Latest) + Vite.
*   **State Management:** **TanStack Query** for server state. Global client state should be minimal.
*   **Validation:** **Zod**.
*   **Styling:** Tailwind CSS.

#### **2.3. Component Patterns**

*   **Functional Components:** Use function declarations.
*   **Props:** Define props with TypeScript interfaces.
*   **Hooks:** Extract complex logic into custom hooks.

#### **2.4. Avoiding Unnecessary `useEffect`**

`useEffect` is a synchronization tool, not a state setter. Overusing it causes extra renders, complexity, and bugs.

**A. Derived State**
Do not use state for data that can be calculated from props or other state.

```tsx
// ❌ Bad: Redundant state and effect
function ProductList({ products }) {
    const [filtered, setFiltered] = useState([]);
    useEffect(() => {
        setFiltered(products.filter(p => p.inStock));
    }, [products]);
    return <List items={filtered} />;
}

// ✅ Good: Direct derivation (useMemo if expensive)
function ProductList({ products }) {
    const filtered = products.filter(p => p.inStock);
    return <List items={filtered} />;
}
```

**B. Mirroring Props to State**
Do not copy props into state unless you intentionally need to diverge from the prop (rare).

```tsx
// ❌ Bad: Syncing prop to state
function Profile({ user }) {
    const [name, setName] = useState('');
    useEffect(() => {
        setName(user.name);
    }, [user]);
    return <div>{name}</div>;
}

// ✅ Good: Read prop directly
function Profile({ user }) {
    return <div>{user.name}</div>;
}
```

**C. Handling User Events**
Handle logic inside event handlers, not by watching state changes.

```tsx
// ❌ Bad: Watching state for API calls
function Search() {
    const [query, setQuery] = useState('');
    useEffect(() => {
        if (query) fetchResults(query);
    }, [query]);
    return <input onChange={e => setQuery(e.target.value)} />;
}

// ✅ Good: Trigger in handler (debounce if needed)
function Search() {
    const handleSearch = (e) => {
        const value = e.target.value;
        setQuery(value);
        fetchResults(value);
    };
    return <input onChange={handleSearch} />;
}
```

**D. Data Transformation**
Transform data inside the render function or within the query selector (TanStack Query), not via effect.

```tsx
// ❌ Bad
useEffect(() => {
    setFormatted(data.map(item => item.value * 2));
}, [data]);

// ✅ Good
const formatted = data.map(item => item.value * 2);
```

**When `useEffect` IS appropriate:**
*   **External Subscriptions:** WebSocket connections, Global event listeners (`window.addEventListener`).
*   **Browser APIs:** Interacting with non-React APIs like `IntersectionObserver`, `Canvas`, or `Map` widgets.
*   **Synchronization:** Keeping a 3rd party library in sync with React props.
*   **Note:** Data fetching should be handled by **TanStack Query**, not `useEffect`.

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

### **7. Spec-Driven Development (SDD)**

*   **Core Principle:** Every feature must have a written specification (MD format) before implementation.
*   **Agent Requirement:** Before starting any implementation, agents **must** clarify the feature requirements with the user, define the API contract, and document the logic in a specification file.
*   **Location:**
    *   **Frontend-only features:** `apps/frontend/specifications/*.md`
    *   **Full-stack or Backend-related features:** `apps/backend/specifications/*.md`
*   **Workflow:**
    1.  Check if a specification already exists for the task.
    2.  If not, discuss requirements and create a new `.md` specification.
    3.  Only after the specification is finalized and saved should implementation begin.
*   **Exceptions:** A separate specification is NOT required for bug fixes, provided the fix does not change the API, add new functionality, or impact the overall architecture.

---

### **8. Testing Guidelines**

We strictly follow the **Test Pyramid** and **TDD** principles.

#### **8.1. Strategies**
*   **Unit (Vitest):** Isolate logic. Mock dependencies. Focus on `domain` and `model` layers.
*   **Integration (Vitest/Supertest/Drizzle):** Test modules together. Use real database instances (Docker) where possible.
*   **E2E (Playwright):** Simulate full user scenarios.

#### **8.2. Best Practices**
*   **AAA Pattern:** Structure tests with **A**rrange (setup), **A**ct (execute), **A**ssert (verify).
*   **TDD:**
    1.  Write a failing test first (Red).
    2.  Implement the minimal code to pass (Green).
    3.  Refactor while keeping the test green (Refactor).
*   **Bug Fixing:** Found a bug? **Stop.** Write a test that reproduces the bug (it must fail). Fix the bug. Verify the test passes.
*   **Quality:** Treat test code as production code. Maintain readability.

---

### **9. Monorepo Workflow**
