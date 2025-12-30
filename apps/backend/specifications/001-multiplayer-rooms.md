# Multiplayer Rooms Specification

## 1. Overview
This feature allows users to create private rooms, invite friends via a link, and race against each other in real-time.

## 2. Terminology
- **Room**: A game session with a unique ID (e.g., `slug` or `uuid`).
- **Host**: The user who created the room. Has privileges to start the race.
- **Participant**: Any user in the room (including the host).
- **State**: The current status of the room (`LOBBY`, `COUNTDOWN`, `RACING`, `FINISHED`).

## 3. Data Models

### 3.1 Room
- **ID**: Unique 6-character code.
- **Status**: Current phase of the race.
- **Config**: Room settings (e.g., word count).
- **Text**: The list of words to type.

### 3.2 Participant
- **Username**: Display name.
- **Role**: Host or regular player.
- **Progress**: Typing completion percentage.
- **WPM**: Current typing speed.
- **Rank**: Finishing position.

## 4. HTTP API

### 4.1 Create Room
- **POST /api/rooms**
- Returns a unique `roomId`.

### 4.2 Get Room Info
- **GET /api/rooms/:roomId**
- Returns initial room state and settings.

## 5. WebSocket Protocol

### 5.1 Client -> Server Messages
- `JOIN_ROOM`: Enter a specific room.
- `START_RACE`: Trigger countdown (Host only).
- `UPDATE_PROGRESS`: Send current typing stats.
- `LEAVE_ROOM`: Exit the room.

### 5.2 Server -> Client Messages
- `ROOM_STATE`: Full sync of room data.
- `PLAYER_JOINED`/`PLAYER_LEFT`: Notifications about participants.
- `COUNTDOWN_START`: Signals race is starting soon.
- `RACE_START`: Signals race has officially begun.
- `PROGRESS_UPDATE`: Broadcast of everyone's speed and progress.
- `RACE_FINISHED`: Final leaderboard.
- `ERROR`: Feedback on invalid actions.