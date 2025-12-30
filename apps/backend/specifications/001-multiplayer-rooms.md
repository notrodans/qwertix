# Multiplayer Rooms & Racing

## 1. Overview
Allows users to create game sessions, invite others via a unique link, and compete in real-time typing races.

## 2. Terminology
- **Room**: A dedicated session for a group of players.
- **Host**: The room creator with authority to start the race.
- **Participant**: Any player currently in the room.
- **State**: Lifecycle of a race (`LOBBY`, `COUNTDOWN`, `RACING`, `FINISHED`).

## 3. Room Features

### 3.1 Configuration (Presets)
- **Modes**:
  - **WORDS**: Race ends after typing a specific number of words.
  - **TIME**: Race ends after a set duration. Text is infinite.
- **Presets**: Pre-defined configurations (e.g., "Standard 30 words", "Blitz 15 seconds").

### 3.2 Dynamic Racing
- **Infinite Scrolling**: In time-based modes, new words are added automatically as players reach the end of the visible text.
- **Live Progress**: Participants see each other's typing speed (WPM) and progress percentage in real-time.

## 4. Results & Performance

### 4.1 Metrics
- **WPM**: Speed based on correctly typed characters.
- **Accuracy**: Percentage of correct vs. total keystrokes.
- **Consistency**: Stability of typing speed throughout the race.
- **Raw WPM**: Total speed including errors.

### 4.2 Replays
- Detailed recording of every keystroke with timestamps.
- Ability to watch a visual playback of the performance after the race.

### 4.3 Persistence
- **Authenticated Users**: Results and replays are saved to the history.
- **Guest Users**: Results are displayed at the end of the race but are not stored.

## 5. API & Protocol

### 5.1 Actions
- Create a room with a specific configuration.
- Join a room via ID.
- Start the race (countdown and kickoff).
- Submit final results and replay data.

### 5.2 Events
- Real-time updates on participants joining or leaving.
- Live broadcast of player progress.
- Notification when the race is completed.
