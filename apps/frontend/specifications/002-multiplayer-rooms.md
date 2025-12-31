# Multiplayer Rooms & Competition

## 1. Overview
Enables real-time competition between players.

## 2. Room Workflow
- **Lobby**: Waiting area.
- **Race Phase**: 
  - **Start**: Immediate start upon Host's command (No Countdown).
  - **Termination**: The race terminates for everyone instantly when the **first player finishes** (Words mode) or time runs out (Time mode).
- **Completion**: Transition to results.

## 3. Results & Replay
- **Calculation**: All metrics (WPM, Accuracy) are calculated strictly on the Server. The Frontend displays '0' or placeholders until authoritative data arrives.
- **Replay Controls**: Users can Pause, Play, and Scrub through the replay timeline.

## 4. Navigation
- **Return to Lobby**: After a game, users are redirected back to the Lobby state (not the typing board) to prepare for the next round.