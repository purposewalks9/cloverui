"use client";

import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/events";
import { Copy, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

export function CopyCodeButton() {
  const [isCopied, setIsCopied] = useState(false);
  const pathname = usePathname();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isCopied ? "Copied" : "Copy code"}
      className="size-7 dark:bg-[#191919] dark:hover:bg-[#212121]"
      onClick={(e) => {
        const container = e.currentTarget.closest("[data-code-container]");
        const pre = container?.querySelector("pre");

        if (!pre) return;

        navigator.clipboard.writeText(pre.textContent ?? "");
        trackEvent("copy_code", { path: pathname });
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1500);
      }}
    >
      {isCopied ? (
        <ThumbsUp className="size-3.5" />
      ) : (
        <Copy className="size-3.5" />
      )}
    </Button>
  );
}
