# Advanced Room Features & Authentication

## 1. Overview
This specification covers advanced multiplayer features: presets, configurable race modes, result persistence, replays, and role-based authentication.

## 2. Authentication

### 2.1 Role-Based Access
- **Admin**: Can create and manage standard user accounts.
- **User**: Standard participant.

### 2.2 Flows
- **Login**: Exchange credentials for a session token.
- **Create User**: Administrative action to onboard new users.
- **Handshake**: Real-time connections can be authenticated to track stats.

## 3. Room Features

### 3.1 Presets
- **System Presets**: Pre-defined configurations available to everyone.
- **Custom Presets**: Personalized settings that can be saved for future use.

### 3.2 Race Modes
- **TIME**: Race ends after a fixed duration. Text is generated dynamically (Infinite Scrolling).
- **WORDS**: Race ends after typing a fixed number of words.

### 3.3 Infinite Text
- For specific modes, the text should replenish as the user approaches the end of the current buffer.

## 4. Results & Persistence

### 4.1 Metrics
- **WPM**: Words Per Minute.
- **Accuracy**: Correctness ratio.
- **Consistency**: Speed variance.
- **Raw**: Total typing speed including errors.

### 4.2 Persistence
- Results are saved to the database only for **authenticated users**.
- Guest participants receive their results at the end of the race, but they are not stored.

## 5. Replays
- The system captures keystroke events with precise timestamps relative to the race start.
- Allows users to watch a visualization of their typing performance.

## 6. API Summary

### 6.1 HTTP
- `/auth/login`: Session management.
- `/users`: User management (Admin only).
- `/presets`: Retrieve or create configurations.
- `/results`: Fetch historical performance data.

### 6.2 WebSocket
- `LOAD_MORE_WORDS`: Request additional text for dynamic modes.
- `SUBMIT_RESULT`: Finalize performance data and replay events.