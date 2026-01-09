# Specification: Solo Mode

## 1. Goal
Implement a solo typing mode similar to Monkeytype, allowing users to practice typing with different configurations and see their performance results.

## 2. Features
- **Mode Selection**: Switch between `TIME` and `WORDS` modes.
- **Value Selection**:
    - For `TIME`: 15, 30, 60, 120 seconds.
    - For `WORDS`: 10, 25, 50, 100 words.
- **Real-time Metrics**: Calculate WPM and Accuracy during and after the run.
- **Infinite Scrolling (TIME mode)**: 
    - Automatically load and append more words as the user approaches the end of the current text.
    - Progress and metrics are preserved during word appending.
- **Results Screen**: Display detailed metrics (WPM, Raw WPM, Accuracy, Consistency) after completion.
- **Replay**: Full visual playback of the session.

## 3. Architecture
### Frontend
- **Feature**: `solo-mode`
    - `model/store.ts`: Reatom atoms for settings (mode, duration, wordCount).
    - `model/solo-model.ts`: Game logic, timer, and state management (Reatom).
    - `ui/solo-toolbar.tsx`: Navigation bar for settings.
    - `compose/solo-typing-mediator.tsx`: Composes typing board, toolbar, and results.
- **Entities**: Reuse `typing-text` (Reatom typing model).

## 4. Workflow
1. User opens the Home page.
2. User selects mode and value from the toolbar.
3. Typing board updates with initial words.
4. User starts typing (status changes to `TYPING`).
5. During the run (TIME mode):
    - System detects when user is close to the end of available text and fetches more words.
    - New words are appended to the existing text array.
    - **AFK Detection**: The system tracks inactivity (gaps > 5s) and focus loss. The time spent inactive is recorded and displayed in results.
    - **Focus Loss**: If the user switches tabs/windows, an "Out of focus" overlay is shown.
6. Upon completion:
    - `WORDS` mode: When the user reaches the end of the target text.
    - `TIME` mode: When time expires.
7. **Submission**:
    - Frontend calculates final stats.
    - Generates a SHA-256 hash using `VITE_RESULT_HASH_SALT` to sign the result.
    - Sends payload (stats, replayData, hash) to `/api/results`.
8. Status changes to `RESULT`, showing the results screen.
9. User can restart or change settings.