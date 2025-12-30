# Multiplayer Rooms & Competition

## 1. Overview
Enables real-time competition between players in shared typing rooms.

## 2. Room Workflow
- **Lobby**: Participants join a room and wait for the host to start. A unique link is available for sharing.
- **Race Phase**: 
  - **Countdown**: A synchronization phase before the race begins.
  - **Active Racing**: Real-time visualization of opponents' progress and speed.
  - **Live Indicators**: 
    - **Time Mode**: Display remaining time before automatic finish.
    - **Word Mode**: Display remaining words for the user to finish first.
- **Completion**: Automatic transition to the results state when objectives are met.

## 3. Advanced Features
- **Infinite Scrolling (Performance Optimized)**: 
  - In Time-based modes, text is automatically appended.
  - To prevent performance degradation, the written portion of the text and input buffer must be cleared periodically upon receiving new word chunks.
- **Presets**: Quick-select configurations for different race lengths and modes.

### 3.3 Real-time Settings Sync
- Participants receive instant updates when the host modifies room settings (e.g., switching from 30 to 50 words).
- The UI must reflect these changes without requiring a page reload or re-joining the room.

## 4. Host Management
- **Host Notification**: Users receive a clear notification when they are promoted to Host (e.g., when the previous host leaves).
- **Settings Persistence**: New hosts inherit and can see the room configuration set by the previous host.
- **Host Transfer**: Hosts have the ability to manually transfer their role to any other participant via a dedicated action.

## 5. Post-Race Analysis
- **Results Screen**: Detailed breakdown of WPM, Accuracy, and Consistency.
- **Replay**: A visual playback system that re-runs the typing session exactly as it happened.
- **Leaderboard**: Final ranking of all participants.