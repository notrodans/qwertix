# Result Verification & Security

## 1. Overview
To ensure data integrity and prevent simple cheating (e.g., modifying HTTP requests), the system employs a dual-layer validation strategy: **Hash Verification** and **Server-Side Replay Analysis**.

## 2. Hash Validation Strategy
Both the frontend and backend share a secret salt (`RESULT_HASH_SALT`). Upon completing a race (Solo or Multiplayer), the frontend generates a cryptographic hash of the result metadata.

### 2.1 Hash Construction
The hash is generated using `SHA-256` algorithm. The input string is constructed by concatenating the following values with hyphens:
`wpm-raw-accuracy-consistency-startTime-endTime-targetTextLength-SALT`

**Parameters:**
- `wpm`: Words Per Minute (integer).
- `raw`: Raw WPM (integer).
- `accuracy`: Accuracy percentage (0-100).
- `consistency`: Consistency score (0-100).
- `startTime`: Timestamp (ms).
- `endTime`: Timestamp (ms).
- `targetTextLength`: Length of the target text string.
- `SALT`: Environment variable `RESULT_HASH_SALT`.

### 2.2 Validation Process
1. Client calculates stats and generates the hash.
2. Client sends payload + hash to the server.
3. Server receives the payload.
4. Server reconstructs the expected hash using its own `RESULT_HASH_SALT`.
5. **Comparison:** If the client's hash does not match the server's calculated hash, the request is rejected immediately with `Invalid result hash`.

## 3. Server-Side Replay Analysis
Even if the hash is valid, the statistics (WPM, Accuracy) are not blindly trusted. The client must send the full `replayData` (array of keystrokes).

### 3.1 Replay Data Structure
```typescript
interface ReplayEvent {
    key: string;
    timestamp: number; // Relative to startTime
    ctrlKey?: boolean;
    confirmedIndex?: number;
}
```

### 3.2 Authoritative Calculation
1. **Text Reconstruction:** The server uses `reconstructText(replayData)` logic to rebuild the final typed string from the event log. This handles complex logic like `Backspace` and `Ctrl+Backspace`.
2. **Stats Derivation:**
   - **WPM**: Calculated from the length of correctly typed words in the reconstructed text over the duration (`endTime - startTime`).
   - **Accuracy**: Calculated by comparing reconstructed text against the target text.
3. **Storage:** The server stores the **calculated** values, not the client-provided values (though client values are used for initial hash check and tolerance comparison).

### 3.3 Tolerance Check
To account for minor discrepancies in floating-point math or timing between client and server:
- **WPM Tolerance**: +/- 5.
- **Accuracy Tolerance**: +/- 2%.

If the difference exceeds these bounds, the result is rejected as `Stats verification failed`.

## 4. Storage
The `hash` is stored in the database alongside the result record to provide an audit trail of the original client claim.
