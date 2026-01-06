# Multiplayer Rooms & Racing

## 1. Overview
Allows users to create game sessions, invite others via a unique link, and compete in real-time typing races.

## 2. Terminology
- **Room**: A dedicated session for a group of players.
- **State**: Lifecycle of a race (`LOBBY`, `COUNTDOWN`, `RACING`, `FINISHED`).

## 3. Room Features

### 3.1 Configuration
- **WORDS Mode**: Fixed word count.
- **TIME Mode**: Fixed duration. Text is infinite.
- **Real-time Synchronization**: Room settings are mutable by the host.

### 3.2 Win Conditions
- **WORDS Mode**: The race ends immediately for **ALL** participants as soon as **ONE** player finishes the text.
- **TIME Mode**: The race ends for all participants when the timer expires.

## 4. Performance & Validation

### 4.1 Security & Verification
- **Hash Check**: Client signs the result with a secret salt. Server verifies integrity before processing.
- **Strict Server-Side Calculation**: The server validates the client's WPM claims by re-calculating them from the raw `replayData`.
- **Tolerance**: Small discrepancies (+/- 5 WPM) are allowed; larger ones result in rejection.

### 4.2 Replay Data
- Frontend provides controls for replay playback: Play, Pause, Scrubbing/Rewind, and Time display.

## 5. API & Protocol

### 5.1 Socket Events
- `COUNTDOWN_START` initiates the race sequence.
- `RACE_START` is sent when the countdown finishes.
- `RACE_FINISHED` is sent when the win condition is met.