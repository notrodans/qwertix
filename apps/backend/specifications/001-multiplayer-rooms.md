# Multiplayer Rooms & Racing

## 1. Overview
Allows users to create game sessions, invite others via a unique link, and compete in real-time typing races.

## 2. Terminology
- **Room**: A dedicated session for a group of players.
- **Host**: The room creator with authority to start the race and manage settings.
- **Participant**: Any player currently in the room.
- **State**: Lifecycle of a race (`LOBBY`, `COUNTDOWN`, `RACING`, `FINISHED`).

## 3. Room Features

### 3.1 Configuration (Presets & Settings)
- **Modes**:
  - **WORDS**: Race ends after typing a specific number of words.
  - **TIME**: Race ends after a set duration. Text is infinite.
- **Presets**: Pre-defined configurations.
- **Real-time Synchronization**: Room settings (mode, duration, word count) are mutable by the host and must be synchronized across all participants instantly upon change.

### 3.2 Dynamic Racing
- **Infinite Scrolling**: Text replenishes automatically. 
- **Live Progress**: Real-time broadcast of player metrics.

### 3.3 Host Management
- **Automatic Succession**: If a host leaves, the system promotes another participant and notifies them.
- **Host Transfer**: Support for explicit transfer of host privileges between users.

## 4. Results & Performance

### 4.1 Metrics
- **WPM**, **Accuracy**, **Consistency**, **Raw WPM**.

### 4.2 Replays
- Precision recording of keystroke events for post-race visualization.

### 4.3 Persistence
- Stats are stored for authenticated users; ephemeral results for guests.

## 5. API & Protocol

### 5.1 Actions
- Create/Join Room.
- **Update Settings**: Modify room configuration in real-time (Host only).
- Start Race.
- **Transfer Host**: New action to change room ownership.
- Submit Results.

### 5.2 Events
- Participant join/leave notifications.
- **Host Promoted**: Specific event to notify a user they are now the host.
- Live progress and race completion events.