"use client";

import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/events";
import { Copy, ThumbsUp } from "lucide-react";
import { usePathname } from "next/navigation";
import { useGhost } from "@/registry/clover-ui/ghost";
import { ghostWords } from "@/components/layout/site-ghost";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

export function CopyCodeButton() {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ resetAfter: 1500 });
  const pathname = usePathname();
  const ghost = useGhost();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isCopied ? "Copied" : "Copy code"}
      className="size-7 rounded-none dark:bg-[#191919] dark:hover:bg-[#212121]"
      onClick={async (e) => {
        const container = e.currentTarget.closest("[data-code-container]");
        const pre = container?.querySelector("pre");

        if (!pre) return;

        if (await copyToClipboard(pre.textContent ?? "")) {
          trackEvent("copy_code", { path: pathname });
          ghost.say(ghostWords.copied);
        }
      }}
    >
      {isCopied ? <ThumbsUp className="size-3.5" /> : <Copy className="size-3.5" />}
    </Button>
  );
}
