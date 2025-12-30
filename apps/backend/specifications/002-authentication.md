# Authentication & User Management

## 1. Overview
Provides a secure way to manage user identities, roles, and historical data tracking.

## 2. Roles & Permissions
- **Admin**: Has administrative privileges to onboard and manage other users.
- **User**: Standard participant who can track personal statistics and history.
- **Guest**: Unauthenticated participant with ephemeral session.

## 3. Core Flows

### 3.1 Login
- Users exchange credentials for an access token to identify themselves in subsequent requests and real-time connections.

### 3.2 Onboarding
- Admins can create new user accounts. Public registration is restricted to maintain a controlled environment.

### 3.3 Session Identity
- All room actions (joining, racing) can be linked to a registered user to ensure performance metrics are saved to their profile.
