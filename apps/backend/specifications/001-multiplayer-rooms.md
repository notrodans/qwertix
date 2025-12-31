# Multiplayer Rooms & Racing

## 1. Overview
Allows users to create game sessions, invite others via a unique link, and compete in real-time typing races.

## 2. Terminology
- **Room**: A dedicated session for a group of players.
- **State**: Lifecycle of a race (`LOBBY`, `RACING`, `FINISHED`). **Note: Countdown phase is removed for instant action.**

## 3. Room Features

### 3.1 Configuration
- **WORDS Mode**: Fixed word count.
- **TIME Mode**: Fixed duration. Text is infinite.
- **Real-time Synchronization**: Room settings are mutable by the host.

### 3.2 Win Conditions
- **WORDS Mode**: The race ends immediately for **ALL** participants as soon as **ONE** player finishes the text.
- **TIME Mode**: The race ends for all participants when the timer expires.

## 4. Performance & Validation

### 4.1 Authoritative Metrics
- **Strict Server-Side Calculation**: The frontend MUST NOT calculate WPM or Accuracy. It sends raw keystroke data (replay) to the server.
- The server calculates final metrics and broadcasts them back.

### 4.2 Replay Data
- Frontend provides controls for replay playback: Play, Pause, Scrubbing/Rewind, and Time display.

## 5. API & Protocol

### 5.1 Socket Events
- `COUNTDOWN_START` is deprecated/removed. `RACE_START` is sent immediately after the host starts the game.
- `RACE_FINISHED` is sent when the win condition is met.