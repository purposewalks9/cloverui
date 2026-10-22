"use client";

import * as React from "react";

export function useCopyToClipboard({ resetAfter = 2000 }: { resetAfter?: number } = {}) {
  const [isCopied, setIsCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  React.useEffect(() => () => clearTimeout(timer.current), []);

  const copyToClipboard = React.useCallback(
    async (text: string) => {
      clearTimeout(timer.current);
      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        timer.current = setTimeout(() => setIsCopied(false), resetAfter);
        return true;
      } catch (error) {
        console.error("Failed to copy text: ", error);
        setIsCopied(false);
        return false;
      }
    },
    [resetAfter],
  );

  return { isCopied, copyToClipboard };
}
