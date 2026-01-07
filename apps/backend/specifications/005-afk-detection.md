# AFK Detection Specification

## 1. Overview
To maintain room hygiene and prevent inactive users (especially hosts) from stalling lobbies, the system will implement an automatic inactivity detection system (AFK).

## 2. Rules

### 2.1 Lobby Inactivity
- **Scope**: Applied only when the room is in the `LOBBY` state.
- **Threshold**: **10 minutes** of no activity.
- **Action**: The user is automatically removed from the room.
- **Notification**:
    - The removed user receives a specific disconnection reason (`AFK_TIMEOUT`).
    - Remaining users see a `PLAYER_LEFT` event.
- **Host Handling**: If the removed user was the host, the existing host reassignment logic (in `Room.ts`) handles transferring the role to the next available participant.

### 2.2 Race Inactivity
- **Scope**: During `COUNTDOWN`, `RACING`, or `FINISHED` states.
- **Threshold**: No automatic kick during a race. Races are generally short. An inactive player simply finishes last or DNF.
- **Exception**: If a race gets stuck (e.g., server error or infinite loop), the general Room TTL (Time To Live) or existing cleanup mechanisms should handle it. AFK detection focuses on the Lobby.

## 3. Implementation Details

### 3.1 Participant Tracking
- The `Participant` entity will track a `lastActiveAt` timestamp.
- Initialized to `Date.now()` upon joining.

### 3.2 Activity Signals
The following socket events reset the `lastActiveAt` timer:
- `UPDATE_SETTINGS`
- `TRANSFER_HOST`
- `START_RACE`
- `UPDATE_PROGRESS` (Not applicable in Lobby, but good for completeness)
- `LOAD_MORE_WORDS`
- `RESTART_GAME`
- `PONG` (Heartbeats? - **Decision**: Heartbeats (`PONG`) happen automatically by the browser/client every 30s. If we count these, a user effectively never goes AFK as long as their browser tab is open. **We should NOT count PONG as activity if we want to detect user presence.** However, if we just want to detect *connection* issues, PONG is fine.
    - **Goal**: Detect *User* inactivity.
    - **Resolution**: Do **NOT** update `lastActiveAt` on `PONG`. Only on explicit user actions.
    - **Issue**: A user might be waiting in the lobby for a friend, doing nothing. 10 minutes is generous, but valid. They might just wiggle the mouse? No, we don't send mouse events.
    - **Refinement**: We can add a simple `KEEP_ALIVE` or `USER_ACTIVITY` event sent by the frontend if the user interacts with the UI (mouse move, focus) if we really want to be precise.
    - **MVP**: For now, explicit actions are the only "proof" of life. 10 minutes in a lobby without changing settings or chatting (future) is a long time. Let's stick to explicit actions + maybe a manual "I'm here" button if we add a warning later. For this iteration: **Explicit Actions Only**.

### 3.3 Periodic Check
- `SocketManager` will run an interval (e.g., every 1 minute).
- It iterates through all rooms.
- If Room is `LOBBY`, checks all participants.
- If `Date.now() - p.lastActiveAt > 10 * 60 * 1000`, remove them.

## 4. API Updates
- **New Socket Event**: `AFK_WARNING` (Optional future) - Warn user 1 min before kick.
- **Disconnect Reason**: Send `reason: "AFK"` in the close frame or error message.
