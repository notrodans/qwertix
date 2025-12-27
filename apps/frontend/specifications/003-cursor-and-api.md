# Cursor Animation & API Integration

## Goal
Enhance the user experience by adding a smooth cursor animation and integrating a mock API for dynamic word generation using MSW.

## Requirements

### 1. Smooth Cursor Animation
- **Visuals:** The cursor should smoothly slide from one character to the next.
- **Implementation:**
    - Use a separate, absolutely positioned `div` for the cursor.
    - Calculate the position (`top`, `left`) of the current character and move the cursor there.
    - Use CSS transitions for `transform` or `left`/`top` properties.
    - The cursor should be a thin vertical line (caret) or a block, depending on preference (User asked for "Monkeytype style", which usually offers both, but the default is often a caret or block with smooth motion. Let's stick to the yellow caret `|` but make it move smoothly).
    - **Note:** Since we are using a simple text rendering approach, finding exact coordinates might require a ref or measuring the DOM elements.

### 2. Word Generation
- **Mock API / Simulation:**
    - Function: `getWords()`
    - Logic: Pick ~20-50 random words from a predefined list.
- **Setup:**
    - Use Playwright route interception for E2E tests (as seen in `e2e/typing.spec.ts`).
    - For development, use a simple local mock or a real backend endpoint if available.

### 3. Data Fetching & Reset
- **State Management:** Use `TanStack Query` (`useQuery`).
- **Flow:**
    - Initial load: Fetch words from `/api/words`.
    - Display loading state (skeleton or spinner) while fetching.
    - On Reset button click: `queryClient.invalidateQueries({ queryKey: ['words'] })` to refetch.

## Architecture Updates

### Shared
- `shared/api`: Setup `queryClient` provider.

### Features
- `features/typing`: Update `useTyping` to handle the new text source.

### Entities
- `entities/typing-text`:
    - `model/queries.ts`: Define the query for fetching words.
    - `ui/text-display.tsx`: Refactor to support the smooth cursor. This might involve wrapping each character in a `span` with a `ref` to calculate positions, or just relying on `ch` units if using a monospaced font (simplest for now, but `ref` is more robust). *Decision:* Use `ref` logic for the active character to get precise coordinates.

### Widgets
- `widgets/typing-board`:
    - Wrap with `QueryClientProvider` (or do this at App root).
    - Handle loading / error states.
