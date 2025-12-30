# Cursor Animation & Data Integration

## 1. Goal
Refine the user experience with smooth animations and establish a connection to dynamic content sources.

## 2. Smooth Caret
- The caret should transition smoothly between characters using interpolations.
- It must accurately track its position even when text wraps to new lines.

## 3. Dynamic Content
- Words should be fetched from a dedicated source.
- Loading states should be shown to prevent layout shifts.
- A reset mechanism must be provided to regenerate the text instantly.