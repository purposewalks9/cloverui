"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Box, Copy, ThumbsUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { Search, type SearchGroup, type SearchItem } from "@/registry/clover-ui/search";
import type { DocSchema } from "@/lib/types";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useConfig } from "@/hooks/use-config";
import { trackEvent } from "@/lib/events";

export function SearchForm({
  docSchema,
  shortcut = true,
  className,
  onNavigate,
}: {
  docSchema: DocSchema;
  shortcut?: boolean;
  className?: string;
  onNavigate?: () => void;
}) {
  const [highlighted, setHighlighted] = useState<SearchItem | null>(null);
  const router = useRouter();
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const [config] = useConfig();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastQuery = useRef("");

  useEffect(() => () => clearTimeout(timer.current), []);

  const onQueryChange = useCallback((query: string) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const value = query.trim();
      if (value && value !== lastQuery.current) {
        lastQuery.current = value;
        trackEvent("search_query", { query: value });
      }
    }, 500);
  }, []);

  const groups = useMemo<SearchGroup[]>(
    () =>
      docSchema.map((group) => ({
        id: group.title,
        label: group.title,
        items: group.items.map((item) => ({
          id: item.href,
          label: item.title,
          category: item.href.startsWith("/components/") ? "Components" : "Docs",
          keywords: [item.description, item.id],
          icon: item.href.startsWith("/components/") ? <Box /> : <BookOpen />,
        })),
      })),
    [docSchema],
  );

  const copyInstall = () => {
    if (!highlighted?.id.startsWith("/components/")) return;
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
      placeholder="Search components..."
      className={className}
      onHighlight={setHighlighted}
      onQueryChange={onQueryChange}
      onSelect={(item) => {
        onNavigate?.();
        router.push(item.id);
      }}
      footer={
        highlighted?.id.startsWith("/components/") ? (
          <button
            type="button"
            onClick={copyInstall}
            className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-md px-1.5 text-neutral-600 hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-neutral-500 dark:text-neutral-300 dark:hover:bg-neutral-800"
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
