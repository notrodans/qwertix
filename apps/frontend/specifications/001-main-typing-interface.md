# Main Typing Interface

## Goal
Create the visual layout for the main typing race interface, mimicking the minimalistic design of Monkeytype.

## Visual Requirements
- **Background:** Dark theme (`#323437` usually, or similar dark gray).
- **Typography:** Monospace font (e.g., Roboto Mono, JetBrains Mono, or system monospace).
- **Layout:**
    - Centered content.
    - Top: Configuration summary (Language, Mode - static for now).
    - Middle: Typing text area. Large font, grayed out text for future words.
    - Bottom: Restart button (icon).
- **Colors:**
    - Background: `#323437` (Monkeytype theme) or `#242424` (Vite default, we'll shift to MT style).
    - Text Main: `#646669` (Un-typed).
    - Text Active: `#d1d0c5` (Typed/Current).
    - Accent: `#e2b714` (Monkeytype yellow) - optional for now.

## Components (FSD)

### Pages
- `pages/home`: The entry point for the typing interface.

### Widgets
- `widgets/typing-board`: Container for the typing session UI.

### Features
- `features/typing-session`: (Future) Logic for handling input.
- `features/controls`: (Future) Settings/Restart. For now `restart-button` can be a shared UI or simple feature component.

### Entities
- `entities/typing-text`: Display logic for the text to be typed.

### Shared
- `shared/ui/layout`: Centered layout container.
- `shared/assets`: Icons (Refresh).

## Acceptance Criteria
- [ ] The page renders a centered typing area.
- [ ] Text is displayed in a monospace font.
- [ ] "English" label is visible at the top.
- [ ] A block of text is visible in the center (dummy text).
- [ ] A refresh button is visible below the text.
