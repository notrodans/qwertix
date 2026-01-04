# Initial Setup & Superuser Creation Specification

## 1. Overview
When the application is launched for the first time (or when no users exist in the database), the user should be presented with a "Welcome / Setup" screen. This screen allows the user to create the initial **Superuser (Admin)** account.

This ensures the application is secured from the start and has an administrator.

## 2. Backend Requirements

### 2.1. API Endpoints

#### `GET /api/auth/setup-status`
- **Purpose:** Check if the application requires initial setup.
- **Logic:** Returns `true` if no users exist in the database, `false` otherwise.
- **Response:**
  ```json
  {
    "isSetupRequired": boolean
  }
  ```

#### `POST /api/auth/setup`
- **Purpose:** Create the initial superuser account.
- **Pre-condition:** Must only succeed if `isSetupRequired` is true (i.e., no users exist).
- **Body:**
  ```json
  {
    "username": "admin",
    "email": "admin@example.com",
    "password": "strongpassword"
  }
  ```
- **Logic:**
  1. Check if users exist. If yes, return `403 Forbidden` (Setup already completed).
  2. Create user with `role: 'admin'`.
  3. (Optional) Automatically log the user in (return JWT/Session).
- **Response:**
  ```json
  {
    "user": { ... },
    "message": "Superuser created successfully"
  }
  ```

### 2.2. Service & Repository Changes
- **UserRepository:** Add `count()` method.
- **AuthService:** Add `isSetupRequired()` method.

## 3. Frontend Requirements

### 3.1. Application Bootstrap
- On application load (e.g., in a root provider or `App.tsx`), fetch `/api/auth/setup-status`.
- If `isSetupRequired` is `true`, redirect to `/setup`.

### 3.2. Setup Page (`/setup`)
- **Route:** `/setup`
- **UI:**
  - Welcome message.
  - Form: Username, Email, Password, Confirm Password.
  - Submit button: "Create Administrator".
- **Logic:**
  - POST to `/api/auth/setup`.
  - On success: Redirect to `/` (Home) or `/login`.

## 4. Security Considerations
- The `/api/auth/setup` endpoint must strictly verify that NO users exist before creating an admin. This prevents malicious users from creating admin accounts later.
