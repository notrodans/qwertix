# Specification: Solo Mode

## 1. Goal
Implement a solo typing mode similar to Monkeytype, allowing users to practice typing with different configurations and see their performance results.

## 2. Features
- **Mode Selection**: Switch between `TIME` and `WORDS` modes.
- **Value Selection**:
    - For `TIME`: 15, 30, 60, 120 seconds.
    - For `WORDS`: 10, 25, 50, 100 words.
- **Real-time Metrics**: Calculate WPM and Accuracy during and after the run.
- **Infinite Scrolling**: (For TIME mode) Automatically load more words as the user types.
- **Results Screen**: Display detailed metrics (WPM, Raw WPM, Accuracy, Consistency) after completion.
- **Replay**: (Optional/Next step) Ability to see a replay of the typing session.

## 3. Architecture
### Frontend
- **Feature**: `solo-mode`
    - `model/store.ts`: Zustand store for current configuration and status.
    - `ui/solo-toolbar.tsx`: Navigation bar for settings.
    - `compose/solo-typing-mediator.tsx`: Composes typing board, toolbar, and results.
- **Entities**: Reuse `typing-text`.

### Backend
- **Endpoint**: Update `/api/words` to accept `count` query parameter.

## 4. Workflow
1. User opens the Home page.
2. User selects mode and value from the toolbar.
3. Typing board updates with new words.
4. User starts typing (status changes to `TYPING`).
5. Upon completion:
    - `WORDS` mode: When all words are typed correctly.
    - `TIME` mode: When time expires.
6. Status changes to `RESULT`, showing the results screen.
7. User can restart or change settings.
