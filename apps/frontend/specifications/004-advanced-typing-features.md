# Advanced Typing Features

## Goal
Refine the typing experience to match Monkeytype standards, focusing on editing control (backspace), visual feedback (errors, cursor), and layout.

## Requirements

### 1. Advanced Backspace Logic
- **Ctrl + Backspace:**
    - Should delete characters from the current cursor position back to the start of the current word.
    - If the cursor is at the start of a word (or on the space preceding it), it should delete the space and the entire previous word (unless locked).
- **Word Locking:**
    - Prevent backspacing into a word that was **correctly** typed and "completed" (user typed the space after it).
    - If a previous word was incorrect or incomplete, the user *can* still backspace into it **unless** they have already completed a subsequent word correctly.
    - Implementation: The `confirmedIndex` (locking boundary) is only updated when a word is completed correctly. If a word is correct, the index jumps to the end of that word, effectively locking it and all preceding text.

### 2. Cursor Animation
- **Issue:** Current animation is "jerky".
- **Fix:**
    - Optimize CSS transition. Use a custom bezier curve for a "snappy" yet smooth feel.
    - **Skip Logic:** When jumping over incomplete words (using space), the cursor position calculation must account for the "gap" to maintain visual alignment with the new word start.
    - Example: `transition: left 0.1s cubic-bezier(0.4, 1, 0.5, 1), top 0.1s cubic-bezier(0.4, 1, 0.5, 1);`

### 3. Word Spacing
- **Issue:** Space between words is too wide.
- **Fix:** Constrain the width of the space character span directly (e.g., `width: 0.5ch`).

### 4. Error Underlining
- **Logic:**
    - Identify "past" words (words fully behind the cursor).
    - If a past word does not match its target substring exactly, apply a red underline (`border-bottom`).
    - **Exclusion:** The underline must NOT include the space character between words. Only the characters of the word itself are underlined.

### 5. Extra Character Handling
- **Goal:** Allow the user to type more characters than the target word contains (simulating "missing a space" or just spamming keys).
- **Behavior:**
    - These "extra" characters should be visually inserted into the current word.
    - They are always considered incorrect (red).
    - **Shifting:** The insertion of these characters must push the subsequent words to the right (standard text flow behavior).
    - **Cursor:** The cursor must move after these extra characters.
    - **Backspace:** Must be able to delete these extra characters.

## Implementation Plan

### `features/typing`
- Update `useTyping`:
    - Remove strict length limit (allow `userTyped` to exceed `targetText` length temporarily within words).
    - Prevent double spaces or spaces at start to maintain word alignment.
    - `lastCorrectWordIndex` logic remains to lock *completed* words, but within the current word, anything goes.

### `entities/typing-text`
- Update `TextDisplay`:
    - **Rendering Strategy:** Change from character-based map to **Word-based** map.
    - Split `targetText` and `userTyped` by space.
    - For each word `i`:
        - Get `targetWord = targetTextWords[i]`.
        - Get `userWord = userTypedWords[i]`.
        - Render `max(targetWord.length, userWord.length)` characters.
        - Characters beyond `targetWord.length` are "Extras" (Error style).
        - Characters matching are Correct/Incorrect.
        - Characters beyond `userWord.length` are Untyped (Gray).
    - **Indices:** Dynamically calculate `data-index` for cursor positioning by counting rendered characters (including extras).
    - **Spacing:** Render space between words explicitly.
