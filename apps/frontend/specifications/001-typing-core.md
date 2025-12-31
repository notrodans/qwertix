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

## 3. Metrics Calculation
- **WPM (Words Per Minute)**: `(typedLength / 5) / (timeInMinutes)`.
- **Accuracy**: `(correctCharacters / totalTypedCharacters) * 100`. Accuracy is calculated based on the total history of keystrokes, providing a standard representation of performance.
- **Raw WPM**: Speed calculated including mistakes, without penalty for incorrect characters.

## 4. Replay System
- **Event Recording**: Every keystroke is recorded with a high-precision timestamp.
- **Metadata**: 
  - `key`: The character or command (e.g., 'Backspace').
  - `ctrlKey`: Recorded for 'Backspace' to handle complex deletions (Ctrl+Backspace).
  - `confirmedIndex`: The state of the confirmed typing index at the time of the event to ensure deterministic reconstruction.
- **Playback**: Deterministic reconstruction of the session using `calculateBackspace` and `appendCharacter` logic.

## 5. Performance Optimization
- **Stable Listeners**: Event listeners use `useRef` for state tracking to avoid expensive re-attachments on every keystroke.
- **Throttling**: Server-side progress updates are throttled (e.g., every 200ms) to reduce network overhead while maintaining visual smoothness.

## 6. Visual Standards
- **Theme**: High-contrast dark theme.
- **Typography**: Monospaced fonts for stable alignment.
- **Layout**: The typing area shows exactly **3 lines** of text. 
- **Line Management**: Words and their following spaces are treated as single units to prevent spaces from wrapping to the start of a new line.