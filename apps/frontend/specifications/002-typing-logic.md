# Typing Logic & Interaction

## Goal
Implement the core typing mechanics: capturing user input, validating against the target text, and providing visual feedback. Ensure the interface remains perfectly centered.

## Requirements

### 1. Typing Interaction
- **Input Method:** Global keyboard event listener (typing anywhere focuses the game).
- **State Management:**
    - `targetText`: The text to be typed.
    - `userTyped`: The string typed by the user so far.
- **Validation:**
    - Compare `userTyped` char vs `targetText` char at the same index.
    - **Correct:** Highlight character (e.g., `#d1d0c5`).
    - **Incorrect:** Highlight character in Red (e.g., `#ca4754`).
    - **Untyped:** Default Gray (`#646669`).
- **Jump on Space:**
    - Pressing the Space key while typing a word must always trigger a transition to the next word, even if the current word is incomplete or incorrect.
- **Cursor:**
    - A visual caret (`|` or block) indicating the current typing position.
    - Should be positioned before the next character to be typed.

### 2. Layout & Styling
- **Centering:** Ensure the main content (typing board) is strictly centered vertically and horizontally on the screen.
- **Alignment:** The text block itself should be left-aligned within the centered container (standard Monkeytype behavior).

## Component Updates

### Features
- `features/typing`:
    - `model/use-typing.ts`: Hook to handle `keydown`, `Backspace`, and ignore modifiers.

### Entities
- `entities/typing-text`:
    - Update `TextDisplay` to accept `userInput` and `targetText` props.
    - Render logic to split text into characters and apply styles based on correctness.

### Widgets
- `widgets/typing-board`:
    - Integrate `useTyping` hook.
    - Pass state to `TextDisplay`.

### Shared
- `shared/ui/layout`:
    - Review `CenterLayout` and `index.css` to ensure no conflicting centering styles.
