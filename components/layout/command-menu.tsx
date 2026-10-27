"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { BookOpen, Box, Copy, ThumbsUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { Search, type SearchGroup, type SearchItem } from "@/components/layout/search";
import type { DocSchema } from "@/lib/types";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useConfig } from "@/hooks/use-config";
import { trackEvent } from "@/lib/events";
import { guideIds } from "@/lib/guides";

const navSearchClassName =
  "border-border border-[0.5px] text-muted-foreground hover:text-foreground bg-transparent hover:bg-transparent h-8 gap-1.5 rounded-none px-2.5 text-[13px] [&>kbd]:bg-transparent [&>kbd]:border-border [&>kbd]:rounded-none [&>kbd]:border [&>kbd]:px-1.5 [&>kbd]:py-px [&>kbd]:text-[11px] [&>kbd]:font-medium [&>kbd]:border-[0.5px] [&>svg]:size-3.5 [&>svg]:stroke-[1.25]";

export function CommandMenu({
  docSchema,
  shortcut = true,
  nav = false,
  compact = false,
  className,
  onNavigate,
}: {
  docSchema: DocSchema;
  shortcut?: boolean;
  nav?: boolean;
  compact?: boolean;
  className?: string;
  onNavigate?: () => void;
}) {
  const [highlighted, setHighlighted] = React.useState<SearchItem | null>(null);
  const router = useRouter();
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const [config] = useConfig();
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastQuery = React.useRef("");

  React.useEffect(() => () => clearTimeout(timer.current), []);

  const onQueryChange = React.useCallback((query: string) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const value = query.trim();
      if (value && value !== lastQuery.current) {
        lastQuery.current = value;
        trackEvent("search_query", { query: value });
      }
    }, 500);
  }, []);

  const groups = React.useMemo<SearchGroup[]>(
    () =>
      docSchema.map((group) => ({
        id: group.title,
        label: group.title,
        items: group.items.map((item) => {
          const guide = guideIds.includes(item.id);
          return {
            id: item.href,
            label: item.title,
            category: guide ? "Docs" : "Components",
            keywords: [item.description, item.id],
            icon: guide ? <BookOpen /> : <Box />,
          };
        }),
      })),
    [docSchema],
  );

  const copyInstall = () => {
    if (highlighted?.category !== "Components") return;
    const prefix =
      { pnpm: "pnpm dlx", bun: "bunx --bun", yarn: "yarn dlx", npm: "npx" }[
        config.packageManager
      ] ?? "npx";
    const command = `${prefix} shadcn@latest add @clover-ui/${highlighted.id.split("/").pop()}`;
    copyToClipboard(command);
    trackEvent("copy_install_command", { command, pm: config.packageManager });
  };

  return (
    <Search
      groups={groups}
      shortcut={shortcut}
      shortcutLabel={nav && shortcut ? "/" : undefined}
      placeholder="Search docs..."
      compact={compact}
      className={cn(nav && navSearchClassName, compact && "size-8 px-0", className)}
      onHighlight={setHighlighted}
      onQueryChange={onQueryChange}
      onSelect={(item) => {
        onNavigate?.();
        router.push(item.id);
      }}
      footer={
        highlighted?.category === "Components" ? (
          <button
            type="button"
            onClick={copyInstall}
            className="text-foreground/70 hover:bg-foreground/10 hover:text-foreground focus-visible:outline-ring inline-flex min-h-9 cursor-pointer items-center gap-1.5 px-1.5 focus-visible:outline-2"
          >
            {isCopied ? (
              <ThumbsUp aria-hidden className="size-4" />
            ) : (
              <Copy aria-hidden className="size-4" />
            )}
            {isCopied ? "Copied" : "Copy"}
          </button>
        ) : null
      }
    />
  );
}
