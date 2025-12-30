# Typing Logic & Interaction

## 1. Goal
Implement core mechanics for capturing input, validating correctness, and providing instant visual feedback.

## 2. Interaction Rules
- **Input Detection:** Keyboard events should be captured globally or via a primary focus area.
- **Visual Feedback:**
    - Each character changes color immediately upon input.
    - Errors should be clearly marked (e.g., red background or text).
- **Navigation:**
    - **Space Key:** Moves focus to the next word immediately, skipping remaining characters in the current word.
    - **Backspace:** Allows correcting characters in the current or previous words (depending on configuration).
- **Caret:** A smooth-moving visual indicator of the next expected character.

## 3. Layout Behavior
- The typing area should remain stable; text should not jump unexpectedly.
- Vertical and horizontal centering of the active area is mandatory.