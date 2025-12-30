import { q as queryOptions, r as reactExports, j as jsxRuntimeExports, u as useQuery } from './index-CegzNlYX.js';

"use strict";
function calculateBackspace(current, confirmedIndex, isCtrlKey) {
  if (current.length <= confirmedIndex) return current;
  if (isCtrlKey) {
    const textAfterConfirmed = current.slice(confirmedIndex);
    const trimmed = textAfterConfirmed.trimEnd();
    const diff = textAfterConfirmed.length - trimmed.length;
    if (diff === 0) {
      const lastSpace2 = trimmed.lastIndexOf(" ");
      if (lastSpace2 === -1) {
        return current.slice(0, confirmedIndex);
      }
      return current.slice(0, confirmedIndex + lastSpace2 + 1);
    }
    const content = trimmed;
    const lastSpace = content.lastIndexOf(" ");
    if (lastSpace === -1) {
      return current.slice(0, confirmedIndex);
    }
    return current.slice(0, confirmedIndex + lastSpace + 1);
  }
  return current.slice(0, -1);
}
function appendCharacter(current, char) {
  if (char === " ") {
    if (current.length === 0) return current;
    if (current.endsWith(" ")) return current;
  }
  return current + char;
}
function checkWordCompletion(typed, targetText) {
  if (!typed.endsWith(" ")) return null;
  const spaceCount = (typed.match(/ /g) || []).length;
  const wordIndex = spaceCount - 1;
  const targetWords = targetText.split(" ");
  if (wordIndex < targetWords.length) {
    const targetWord = targetWords[wordIndex];
    const userWords = typed.split(" ");
    const lastTypedWord = userWords[wordIndex];
    if (lastTypedWord === targetWord) {
      return typed.length;
    }
  }
  return null;
}
function calculateCursorIndex(targetText, userTyped) {
  const targetWords = targetText.split(" ");
  const userWords = userTyped.split(" ");
  const activeWordIndex = userWords.length - 1;
  const activeWordChars = userWords[activeWordIndex]?.length ?? 0;
  let calculatedIndex = 0;
  for (let i = 0; i < activeWordIndex; i++) {
    if (i >= targetWords.length) break;
    const targetWord = targetWords[i];
    if (typeof targetWord === "undefined") break;
    const userWord = userWords[i] || "";
    const maxLength = Math.max(targetWord.length, userWord.length);
    calculatedIndex += maxLength;
    if (i < targetWords.length - 1) {
      calculatedIndex++;
    }
  }
  calculatedIndex += activeWordChars;
  return calculatedIndex;
}

"use strict";
const wordQueries = {
  all: () => ["words"],
  list: () => queryOptions({
    queryKey: wordQueries.all(),
    queryFn: async () => {
      const response = await fetch("/api/words");
      if (!response.ok) {
        throw new Error("Failed to fetch words");
      }
      return response.json();
    },
    refetchOnWindowFocus: false
  })
};

"use strict";
function useCursorPositioning(containerRef, setCaretPos) {
  return reactExports.useCallback(
    (cursorIndex) => {
      if (!containerRef.current) return;
      const activeEl = containerRef.current.querySelector(
        `[data-index="${cursorIndex}"]`
      );
      if (activeEl) {
        setCaretPos({ left: activeEl.offsetLeft, top: activeEl.offsetTop });
      } else {
        const prevIndex = cursorIndex - 1;
        const prevEl = containerRef.current.querySelector(
          `[data-index="${prevIndex}"]`
        );
        if (prevEl) {
          setCaretPos({
            left: prevEl.offsetLeft + prevEl.offsetWidth,
            top: prevEl.offsetTop
          });
        } else if (cursorIndex === 0) {
          const firstEl = containerRef.current.querySelector(
            '[data-index="0"]'
          );
          if (firstEl) {
            setCaretPos({
              left: firstEl.offsetLeft,
              top: firstEl.offsetTop
            });
          }
        }
      }
    },
    [containerRef, setCaretPos]
  );
}

"use strict";
function useTyping(targetText, containerRef) {
  const [userTyped, setUserTyped] = reactExports.useState("");
  const [confirmedIndex, setConfirmedIndex] = reactExports.useState(0);
  const [caretPos, setCaretPos] = reactExports.useState({ left: 0, top: 0 });
  const [replayData, setReplayData] = reactExports.useState([]);
  const [startTime, setStartTime] = reactExports.useState(null);
  const updateCursor = useCursorPositioning(containerRef, setCaretPos);
  const handleKeyDown = reactExports.useCallback(
    (event) => {
      if (event.altKey) return;
      if ((event.ctrlKey || event.metaKey) && event.key !== "Backspace") return;
      if (!startTime) setStartTime(Date.now());
      const timestamp = Date.now() - (startTime || Date.now());
      if (event.key === "Backspace") {
        setReplayData((prev) => [...prev, { key: "Backspace", timestamp }]);
        const next = calculateBackspace(
          userTyped,
          confirmedIndex,
          event.ctrlKey || event.metaKey
        );
        setUserTyped(next);
        const nextIndex = calculateCursorIndex(targetText, next);
        requestAnimationFrame(() => updateCursor(nextIndex));
        return;
      }
      if (event.key.length === 1) {
        if (event.key === " ") {
          event.preventDefault();
        }
        setReplayData((prev) => [
          ...prev,
          { key: event.key, timestamp: Date.now() - (startTime || Date.now()) }
        ]);
        const next = appendCharacter(userTyped, event.key);
        if (next === userTyped) return;
        setUserTyped(next);
        if (event.key === " ") {
          const newConfirmedIndex = checkWordCompletion(next, targetText);
          if (newConfirmedIndex !== null) {
            setConfirmedIndex(newConfirmedIndex);
          }
        }
        const nextIndex = calculateCursorIndex(targetText, next);
        requestAnimationFrame(() => updateCursor(nextIndex));
      }
    },
    [targetText, confirmedIndex, updateCursor, userTyped]
  );
  reactExports.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
  const reset = reactExports.useCallback(() => {
    setUserTyped("");
    setConfirmedIndex(0);
    requestAnimationFrame(() => updateCursor(0));
  }, [updateCursor]);
  return {
    userTyped,
    caretPos,
    reset,
    replayData,
    setUserTyped,
    setReplayData
  };
}

"use strict";
function Caret({ left, top }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "absolute w-0.5 h-[1.5em] bg-[#e2b714]",
      "data-testid": "cursor",
      style: {
        left,
        top,
        transition: "left 0.2s cubic-bezier(0.4, 1, 0.5, 1), top 0.2s cubic-bezier(0.4, 1, 0.5, 1)"
      }
    }
  );
}

"use strict";
function Character({
  char,
  color,
  index,
  type = "target",
  status = "untyped",
  width
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      "data-index": index,
      "data-testid": "char",
      "data-type": type,
      "data-status": status,
      "data-char-value": char,
      className: "inline-block",
      style: { color, width },
      children: char === " " ? " " : char
    }
  );
}

"use strict";
function Word({ children, index, state, hasError }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      "data-testid": "word",
      "data-state": state,
      "data-has-error": hasError,
      className: `inline-block mr-0 border-b-2 ${hasError ? "border-[#ca4754]" : "border-transparent"}`,
      children
    },
    index
  );
}

"use strict";
function TextDisplay({
  targetText,
  userTyped,
  caretPos,
  containerRef,
  className,
  ...props
}) {
  let globalIndex = 0;
  const targetWords = targetText.split(" ");
  const userWords = userTyped.split(" ");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      ref: containerRef,
      className: `font-mono text-2xl leading-relaxed wrap-break-word relative ${className}`,
      "data-testid": "text-display",
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Caret, { left: caretPos.left, top: caretPos.top }),
        targetWords.map((targetWord, wordIndex) => {
          const userWord = userWords[wordIndex] || "";
          const isPast = userWords.length > wordIndex + 1;
          const isActive = userWords.length === wordIndex + 1;
          let wordState = "upcoming";
          if (isPast) wordState = "past";
          else if (isActive) wordState = "active";
          const isCorrectWord = userWord === targetWord;
          const hasExtras = userWord.length > targetWord.length;
          const hasError = isPast && !isCorrectWord || hasExtras;
          const maxLength = Math.max(targetWord.length, userWord.length);
          const chars = [];
          for (let i = 0; i < maxLength; i++) {
            const charIndex = globalIndex++;
            const targetChar = targetWord[i];
            const userChar = userWord[i];
            let charToRender = targetChar;
            let color = "#646669";
            let charType = "target";
            let charStatus = "untyped";
            if (i < userWord.length) {
              if (i < targetWord.length) {
                charToRender = targetChar;
                if (userChar === targetChar) {
                  color = "#d1d0c5";
                  charStatus = "correct";
                } else {
                  color = "#ca4754";
                  charStatus = "incorrect";
                }
              } else {
                charToRender = userChar;
                color = "#7e2a33";
                charType = "extra";
                charStatus = "extra";
              }
            } else {
              charToRender = targetChar;
            }
            chars.push(
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Character,
                {
                  index: charIndex,
                  char: charToRender ?? "",
                  color,
                  type: charType,
                  status: charStatus
                },
                charIndex
              )
            );
          }
          const showSpace = wordIndex < targetWords.length - 1;
          let spaceEl = null;
          if (showSpace) {
            const spaceIndex = globalIndex++;
            const isSpaceTyped = userWords.length > wordIndex + 1;
            spaceEl = /* @__PURE__ */ jsxRuntimeExports.jsx(
              Character,
              {
                index: spaceIndex,
                char: " ",
                color: "#646669",
                type: "space",
                status: isSpaceTyped ? "typed" : "untyped",
                width: "0.5ch"
              },
              spaceIndex
            );
          }
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Word, { index: wordIndex, state: wordState, hasError, children: chars }),
            spaceEl
          ] }, wordIndex);
        })
      ]
    }
  );
}

"use strict";

"use strict";
function TypingSessionLayout({
  config,
  board,
  controls,
  state = "ready",
  loadingFallback,
  errorFallback
}) {
  if (state === "loading" && loadingFallback) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: loadingFallback });
  }
  if (state === "error" && errorFallback) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: errorFallback });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex flex-col gap-8 w-full max-w-3xl",
      "data-testid": "typing-board",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-testid": "config-summary", className: "flex justify-center", children: config }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative min-h-37.5", children: board }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center mt-8", children: controls })
      ]
    }
  );
}

"use strict";
function RefreshIcon({ className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      className,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 3v5h5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M21 21v-5h-5" })
      ]
    }
  );
}

"use strict";
function RestartButton({ onReset, className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      type: "button",
      onClick: onReset,
      "data-testid": "restart-button",
      className: `text-[#646669] hover:text-[#d1d0c5] transition-colors p-4 rounded cursor-pointer ${className}`,
      "aria-label": "Restart Test",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, { className: "w-6 h-6" })
    }
  );
}

"use strict";
function TypingConfigSummary({
  language = "English",
  mode = "words"
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 text-[#646669] text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: language }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "•" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: mode })
  ] });
}

"use strict";
function TypingStatusIndicator({
  state,
  message
}) {
  if (state === "loading") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        "data-testid": "loading-state",
        className: "flex justify-center items-center h-50 text-[#646669]",
        children: message || "Loading..."
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-testid": "error-state",
      className: "flex justify-center items-center h-50 text-[#ca4754]",
      children: message || "Failed to load words."
    }
  );
}

"use strict";

"use strict";
function TypingBoard() {
  const {
    data: words,
    isLoading,
    isError,
    refetch
  } = useQuery(wordQueries.list());
  const containerRef = reactExports.useRef(null);
  const text = words ? words.join(" ") : "";
  const { userTyped, caretPos, reset } = useTyping(text, containerRef);
  const handleReset = () => {
    refetch();
    reset();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    TypingSessionLayout,
    {
      state: isLoading ? "loading" : isError ? "error" : "ready",
      loadingFallback: /* @__PURE__ */ jsxRuntimeExports.jsx(TypingStatusIndicator, { state: "loading" }),
      errorFallback: /* @__PURE__ */ jsxRuntimeExports.jsx(TypingStatusIndicator, { state: "error" }),
      config: /* @__PURE__ */ jsxRuntimeExports.jsx(TypingConfigSummary, {}),
      board: /* @__PURE__ */ jsxRuntimeExports.jsx(
        TextDisplay,
        {
          targetText: text,
          userTyped,
          caretPos,
          containerRef,
          className: "wrap-break-word text-justify"
        }
      ),
      controls: /* @__PURE__ */ jsxRuntimeExports.jsx(RestartButton, { onReset: handleReset })
    }
  );
}

export { TypingBoard };
//# sourceMappingURL=typing-board-CwMSGxFf.js.map
