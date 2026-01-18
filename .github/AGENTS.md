# Project Development Guidelines for AI Assistants

This document outlines the core conventions, technologies, and patterns used in this project (**Qwertix**). Please adhere to these guidelines strictly to maintain code consistency and quality.

### **1. General Project Context**

*   **Goal:** Create a high-performance typing competition platform (Monkeytype clone) specifically designed for **real-time racing with friends**. The core focus is on social interaction, ease of joining races (invite links), and live competition feedback.
*   **Structure:** This is a monorepo managed via **Bun workspaces**.
    *   **`apps/frontend`**: The main web application (Feature-Sliced Design).
    *   **`apps/backend`**: The API and WebSocket server.
*   **Package Manager:** **Bun**. Use `bun install`, `bun add`, and `bun run`.
*   **Primary Technologies:**
    *   **Frontend:** React (Latest) + Vite, TanStack Query, Zustand, React Router DOM, openapi-ts, Zod, Tailwind CSS, `@tailwindcss/vite`, `@t3-oss/env-core`, **Feature-Sliced Design (FSD)**.
    *   **Backend:** Node.js, Fastify, WebSockets (`ws`), PostgreSQL (Drizzle ORM, `pg` driver), Zod, Awilix, bcryptjs, dotenv, pino-pretty, uuid.
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

**Exception:**
The file `apps/frontend/src/shared/model/router/routes.tsx` is an exception. It serves as the central router configuration and is allowed to import from upper layers (`pages`, `features`) to map routes to components. This is handled via a special ESLint rule.

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
*   **State Management:** **TanStack Query** for server state, **Zustand** for global client state.
*   **Validation:** **Zod**.
*   **Styling:** Tailwind CSS.
*   **API Proxy:** All requests to the backend API should be made to the `/api` endpoint. This is proxied to the backend server via `vite`.

#### **2.3. Component Patterns**

*   **Functional Components:** Use function declarations.
*   **Props:** Define props with TypeScript interfaces.
*   **Hooks:** Extract complex logic into custom hooks.

#### **2.4. Avoiding Unnecessary `useEffect`**

`useEffect` is a synchronization tool, not a state setter. Overusing it causes extra renders, complexity, and bugs. **Strongly prefer explicit behavior** (direct function calls, event handlers) over implicit synchronization via `useEffect`. Logic should be easy to trace; `useEffect` often obscures the trigger of an action.

**Core Rules:**
*   **Source of Truth Cache Segregation:** Do not combine cache and source of truth in a single state.
*   **Raw Data Storage:** Store the most raw data possible; all transformations and derived values must happen during the render phase.
*   **Unidirectional Flow:** Use unidirectional data flow instead of `useEffect` for internal logic.
*   **No Infrastructure Effects:** Never use `useEffect` inside infrastructure-related code.
*   **Encapsulation:** Hide all "normal" `useEffect` calls inside specialized custom hooks.

**When `useEffect` IS appropriate:**
1.  **Cache Synchronization:** Keeping a local cache in sync with an external source.
2.  **Lifecycle Notifications:** Knowing when a component has **mounted** or **unmounted**.
3.  **Animations:** Starting or controlling animations.
4.  **Logging:** Performing side-effectful logging or analytics.
5.  **Local State -> External API:** Syncing local state to DOM/Browser APIs or LocalStorage.
6.  **External Source -> Local State:** Syncing Server APIs or WebSockets to local state.

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

**E. Syncing with DOM Layout**
When you need to measure DOM elements (e.g., to position a tooltip or cursor) and update the UI immediately to prevent flicker, use `useLayoutEffect`. This runs synchronously after DOM mutations but before the browser paints.

```tsx
// ✅ Good: Measuring DOM to position an element
function Tooltip({ targetRef }) {
    const [style, setStyle] = useState({});

    useLayoutEffect(() => {
        if (targetRef.current) {
            const rect = targetRef.current.getBoundingClientRect();
            setStyle({ top: rect.bottom + 10, left: rect.left });
        }
    }, [targetRef]); // Re-measures if ref changes

    return <div style={style}>Content</div>;
}
```

**When `useEffect` IS appropriate:**
*   **External Subscriptions:** WebSocket connections, Global event listeners (`window.addEventListener`).
*   **Browser APIs:** Interacting with non-React APIs like `IntersectionObserver`, `Canvas`, or `Map` widgets.
*   **Note:** Data fetching should be handled by **TanStack Query**, not `useEffect`.

---

### **3. Backend Development (apps/backend)**

#### **3.1. Core Stack**

*   **Runtime:** Node.js (executed via `tsx` in dev).
*   **Build Tool:** **tsc** (for ESM production bundles).
*   **Framework:** **Fastify**.
*   **Real-time:** Native **ws** library.
*   **Database:** **PostgreSQL**.
    *   **Query Builder:** **Drizzle ORM**.
    *   **Driver:** `pg` (node-postgres).
*   **Validation:** **Zod**.
*   **Authentication:** `@fastify/jwt`, `@fastify/passport`, `@fastify/secure-session`, `passport-local`, `bcryptjs`.
*   **Dependency Injection:** `awilix`.
*   **Environment Variables:** `dotenv`, `@t3-oss/env-core`.
*   **Logging:** `pino-pretty`.
*   **Utilities:** `uuid`.
*   **Testing:** **Vitest** (Unit & E2E via Supertest).

#### 3.2. Architecture

*   **Dependency Injection (DI):** Implement the Dependency Inversion Principle (DIP) using Dependency Injection (DI). Use a DI container (e.g., `awilix`) to manage dependencies.
    *   **Services** and **Controllers** should accept their dependencies via constructor injection.
    *   Avoid direct imports of singletons (e.g., `roomManager`) in business logic classes.
*   **Controllers:** Handle HTTP requests and WebSocket events.
*   **Services:** Contain business logic.
*   **Repositories:** Contain **Drizzle** queries.

**Repository Example (Drizzle):**

```typescript
import { eq } from 'drizzle-orm';
import { DataBase } from '../db';
import { users } from '../db/schema';

export const UserRepository = {
    constructor(private db: DataBase) {}

    async findById(id: number) {
        const result = await this.db.source.select().from(users).where(eq(users.id, id));
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

We strictly follow the **Test Pyramid** and **TDD** principles. We prefer the **Detroit (Classic) School of Testing**, emphasizing state-based verification and testing units of behavior rather than strict isolation of classes via mocks.

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
*   **Mandatory Verification:** Every solved problem, bug fix, or new feature MUST be accompanied by at least one relevant test to ensure the solution works as intended and to prevent future regressions.
*   **Quality:** Treat test code as production code. Maintain readability.

#### **8.3. Built-in Fake Objects**
*   **Concept:** Instead of using mocking frameworks (like Mockito or generic Jest mocks) to create complex mock objects on the fly, use **Built-in Fake Objects**.
*   **Implementation:** Create "Fake" implementations of your interfaces or classes that reside next to the real code (e.g., in a `__mocks__` folder or exported with a `Fake` prefix).
*   **Benefits:**
    *   **Simpler Setup:** Tests become shorter and more readable because you instantiate a `FakeUser` instead of mocking 10 methods.
    *   **Reusability:** Fakes are reusable across multiple tests.
    *   **Maintainability:** When the interface changes, you update the Fake once, not every single test that mocks it.
*   **Rule:** If a unit test requires mocking more than a couple of methods or objects, consider creating a reusable Fake object instead.

#### **8.4. Anti-Patterns to Avoid**
*   **The Mockery:** Excessive use of mocks to the point where you are testing the mocks, not the system. **Solution:** Use Fakes.
*   **The Inspector (Anal Probe):** Testing private methods or internal state using reflection or loopholes. **Rule:** Only test public behavior (API).
*   **The Slow Poke:** Unit tests that run slowly. **Rule:** Unit tests must be instant (milliseconds). If it touches the DB/File System/Network, it's an integration test.
*   **The Giant:** Huge test classes or methods. **Rule:** Keep tests focused and small.
*   **The Happy Path:** Only testing the "success" case. **Rule:** Explicitly test edge cases and error handling.
*   **The Local Hero:** Tests that only pass on your machine (dependent on local env/config).
*   **The Cuckoo:** Tests that sit in the wrong place or test the wrong thing (e.g., testing `ArrayList` inside `UserTest`).
*   **The Liar:** Tests that always pass but don't check the result.
*   **The Conjoined Twins:** Tests that are not isolated and depend on each other.
*   **The Generous Leftovers:** Tests that leave dirty state (files, DB records) for other tests.
*   **The Nitpicker:** Tests that compare the entire output when only a specific part matters.
*   **The Secret Catcher:** Tests that rely on exceptions being thrown without explicit assertions.
*   **The Dodger:** Tests that check for side effects but ignore the main behavior.
*   **The Loudmouth:** Tests that clutter the console with logs.
*   **The Greedy Catcher:** Tests that catch exceptions and swallow them.
*   **The Sequencer:** Tests that depend on execution order.
*   **The Enumerator:** Tests named `test1`, `test2`, etc., without semantic meaning.
*   **The Free Ride:** Adding assertions to an existing test instead of writing a new one.
*   **The Excessive Setup:** Tests where setup takes more lines than the actual test logic.
*   **The Line Hitter:** Tests written solely to increase code coverage metrics.
*   **The Forty-Foot Pole:** Tests that are too far removed from the code they are testing (testing through too many layers).
*   **Test-per-Method:** Creating a test for every single method. **Rule:** Test behaviors, not methods.
*   **White Box Testing:** Avoid testing internal implementation details. Tests should focus on behavior and public APIs. Only use White Box testing if absolutely necessary and after user confirmation.

---

### **9. Monorepo Workflow**

*   **Workspaces:** Use `bun` workspaces to manage dependencies.
*   **Shared Libraries:** Place shared code (contracts, utilities, UI kits) in `libs/*`.
*   **Cross-Import:** Applications can import from `libs/*` but NOT from other `apps/*`.

---

### **10. Emerging Best Practices (Refined)**

These practices have emerged from recent refactoring and performance optimization tasks

#### **10.1. State Management & Effects**
*   **No Synchronization Effects:** Never use `useEffect` to synchronize state or refs (e.g., `useEffect(() => { ref.current = val }, [val])`).
    *   **Solution (Render-Phase Updates):** Update refs synchronously during render: `ref.current = props.value`. This ensures the ref is always up-to-date for event handlers without causing extra commits or lag.
*   **Source of Truth Segregation:** Do not mix cache and source of truth in one state object.
*   **Raw Data Preference:** Store raw data and perform all transformations in render.
*   **Unidirectional Flow:** Prefer unidirectional data flow over `useEffect`.
*   **Atomic Updates:** Group related state into a single object when they need to be updated together (e.g., typing cursor, text, and timestamp). Use functional updates `setState(prev => ...)` to access the latest state inside stable callbacks without stale closures.
*   **Event-Driven vs Effect-Driven:** Trigger logic (like "Game Finished") directly from event handlers (e.g., `onType`, `onSocketMessage`) rather than watching state changes with `useEffect`. State should be a result of events, not a trigger for logic.
*   **Hook Encapsulation:** All good `useEffect` usages must be hidden within custom hooks. Never use `useEffect` inside infrastructure layers.

#### **10.2. Architecture Layers**
*   **Presentational Components (View):** UI components (like `MultiplayerBoard`) must be "dumb". They receive data and callbacks via props and have **zero** business logic, side effects, or internal state that isn't purely visual.
*   **Feature Hooks (Model):** Encapsulate all logic (timers, socket events, game state) in custom hooks (e.g., `useMultiplayerGame`). These hooks expose a clean API (methods like `startTimer`, `forceFinish`) to the consumer.
*   **Mediators (Compose):** Connect the Model (Hooks) to the View (Components) and Transport (Sockets).
*   **Transport Layer (API):** Encapsulate WebSocket connections in dedicated API functions (e.g., `connectToRoom`) that take callbacks. Do not put `socket.on(...)` logic directly inside React components or hooks.

#### **10.3. Performance & Optimization**
*   **Stable Handlers:** Event listeners (keydown, socket events) must be stable. Do not recreate them on every render. Use `useRef` to hold mutable dependencies (like current text or config) accessed inside these stable handlers.
*   **Throttling:** Network-heavy updates (like `onProgress`) must be throttled (e.g., `useThrottledCallback`) to prevent server congestion.
*   **Animation:** Use `requestAnimationFrame` for high-frequency visual updates (cursor movement) to decouple them from React's render cycle where possible.

#### **10.4. Reliability & Security**
*   **Authoritative Server:** Never trust the client for game-critical calculations (WPM, Accuracy, Win Condition). Send raw events (`replayData`) to the backend, calculate stats there, and broadcast the result.
*   **Contracts:** Use shared TypeScript interfaces (`libs/room-contracts`) for **all** WebSocket messages (`SocketAction`, `SocketEvent`). This guarantees type safety across the full stack.

---

### **11. Reatom v1000 & Migration from v3**

Reatom v1000 uses implicit context management via a global variable. Explicit `ctx` is no longer needed in the public API.

**Core Rules:**
*   **NEVER use `ctx` or `Ctx`:** The API is context-based implicitly via `wrap`.
*   **No Manual Context Passing:** Do not pass `ctx` to actions or atoms.
*   **Async Boundaries:** Use `wrap(promise)` to preserve context across `await`.
*   **Implicit Tracking:** Use `anAtom()` instead of `ctx.spy(anAtom)` and `peek(anAtom)` instead of `ctx.get(anAtom)`.

**Migration Table:**

| v3 Pattern | v1000 Equivalent |
| :--- | :--- |
| `ctx.schedule(() => promise)` | `wrap(promise)` |
| `ctx.spy(dataAtom)` | `dataAtom()` |
| `ctx.get(dataAtom)` | `peek(dataAtom)` |
| `atom(callback)` | `computed(callback)` |
| `dataAtom(ctx, newState)` | `dataAtom.set(newState)` |
| `dataAtom(ctx, (state) => newState)` | `dataAtom.set((state) => newState)` |
| `ctx.spy(dataAtom, callback)` | `ifChanged(dataAtom, callback)` |
| `reatomAsync(cb)` | `action(cb).extend(withAsync())` |
| `reatomResource(cb)` | `computed(cb).extend(withAsyncData())` |
| `reaction` | `effect` |
| `anAtom.onChange(cb)` | `anAtom.extend(withChangeHook(cb))` |
| `onConnect(anAtom, cb)` | `anAtom.extend(withConnectHook(cb))` |
| `take(anAtom, (ctx, val, SKIP))` | `take(anAtom, (val) => val \|\| throwAbort())` |
| `withConcurrency` | `withAbort` |

**Component Lifecycle Management:**
To ensure state is cleaned up when navigating away from a page, use the **Computed Factory** pattern or local model instances via `useMemo` in React components. Avoid global atoms for page-specific state.
