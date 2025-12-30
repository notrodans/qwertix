# Core Typing Mechanics

## 1. Goal
Provide a minimalist, high-performance typing experience with instant feedback and smooth visuals.

## 2. Interaction Rules
- **Input Method**: Captures keystrokes globally while the game is active.
- **Validation**: 
  - Characters change color based on correctness (Correct, Incorrect, Untyped).
  - Mistakes are visually distinct.
- **Navigation**:
  - **Space**: Jumps to the next word immediately, even if the current one is unfinished.
  - **Backspace**: Allows correction of typed characters.
- **Caret**: A smooth-moving visual indicator of the active typing position.

## 3. Dynamic Content
- Text is generated or fetched dynamically for each session.
- A reset mechanism allows starting a new session with fresh text instantly.

## 4. Visual Standards
- **Theme**: High-contrast dark theme.
- **Typography**: Monospaced fonts for stable alignment.
- **Centering**: The typing area remains strictly centered on the screen.
