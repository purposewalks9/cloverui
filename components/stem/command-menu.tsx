"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CornerDownLeft, Search } from "lucide-react";
import {
  Command,
  CommandCollection,
  CommandDialog,
  CommandDialogPopup,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPanel,
  CommandSeparator,
} from "@/components/ui/command";
import { DocSchema } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useIsMac } from "@/hooks/use-is-mac";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useConfig } from "@/hooks/use-config";
import { trackEvent } from "@/lib/events";

interface PageItem {
  value: string;
  label: string;
  url: string;
  isComponent: boolean;
}

interface PageGroup {
  value: string;
  items: PageItem[];
}

export function SearchForm({ docSchema }: { docSchema: DocSchema }) {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<"page" | "component" | null>(null);
  const [copyPayload, setCopyPayload] = useState("");
  const router = useRouter();
  const isMac = useIsMac();
  const { copyToClipboard } = useCopyToClipboard();
  const [config] = useConfig();
  const packageManager = config.packageManager;

  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastTrackedQueryRef = useRef<string>("");

  const trackSearchQuery = useCallback((query: string) => {
    const trimmed = query.trim();
    if (trimmed && trimmed !== lastTrackedQueryRef.current) {
      lastTrackedQueryRef.current = trimmed;
      trackEvent("search_query", { query: trimmed });
    }
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const groupedItems = useMemo<PageGroup[]>(() => {
    return docSchema.map((group) => {
      const isComponentGroup = group.title !== "Getting Started";
      return {
        value: group.title,
        items: group.items.map((item) => ({
          value: item.id,
          label: item.title,
          url: isComponentGroup ? `/components/${item.id}` : `/docs/${item.id}`,
          isComponent: isComponentGroup,
        })),
      };
    });
  }, [docSchema]);

  const handlePageHighlight = useCallback(
    (item: PageItem | null) => {
      if (!item) {
        setSelectedType(null);
        setCopyPayload("");
        return;
      }

      if (item.isComponent) {
        const componentName = item.url.split("/").pop();
        setSelectedType("component");
        const componentArg = `@clover-ui/${componentName}`;
        let cmd: string;
        switch (packageManager) {
          case "pnpm":
            cmd = `pnpm dlx shadcn@latest add ${componentArg}`;
            break;
          case "bun":
            cmd = `bunx --bun shadcn@latest add ${componentArg}`;
            break;
          case "yarn":
            cmd = `yarn dlx shadcn@latest add ${componentArg}`;
            break;
          default:
            cmd = `npx shadcn@latest add ${componentArg}`;
        }
        setCopyPayload(cmd);
      } else {
        setSelectedType("page");
        setCopyPayload("");
      }
    },
    [packageManager],
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }

        e.preventDefault();
        setOpen((open) => !open);
      }

      if (e.key === "c" && (e.metaKey || e.ctrlKey)) {
        if (selectedType === "component" && copyPayload) {
          copyToClipboard(copyPayload);
          trackEvent("copy_install_command", { command: copyPayload, pm: packageManager });
        }
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [copyPayload, selectedType, copyToClipboard]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-muted-foreground hover:bg-sidebar-accent hover:text-foreground focus-visible:ring-ring bg-sidebar-accent/60 hidden h-8 cursor-pointer items-center gap-2 rounded-full pr-1.5 pl-3 text-sm transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none sm:inline-flex"
      >
        <Search className="size-3.5" />
        <span className="pr-6 lg:pr-10">Search</span>
        <kbd className="bg-sidebar-accent text-muted-foreground rounded-full px-2 py-0.5 font-sans text-[11px] font-medium">
          {isMac ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>
      <CommandDialog onOpenChange={setOpen} open={open}>
        <CommandDialogPopup>
          <Command
            items={groupedItems}
            onItemHighlighted={(highlightedValue) => {
              const item = highlightedValue as PageItem | null;
              handlePageHighlight(item);
            }}
          >
            <CommandInput
              placeholder="Type a command or search..."
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (searchTimeoutRef.current) {
                  clearTimeout(searchTimeoutRef.current);
                }
                searchTimeoutRef.current = setTimeout(() => {
                  trackSearchQuery(e.target.value);
                }, 500);
              }}
            />
            <CommandPanel>
              <CommandEmpty>The search results could not be found.</CommandEmpty>
              <CommandList>
                {(group: PageGroup, _index: number) => (
                  <Fragment key={group.value}>
                    <CommandGroup items={group.items}>
                      <CommandGroupLabel>{group.value}</CommandGroupLabel>
                      <CommandCollection>
                        {(item: PageItem) => (
                          <CommandItem
                            key={item.value}
                            onClick={() => {
                              router.push(item.url);
                              setOpen(false);
                            }}
                            value={item.value}
                          >
                            {item.label}
                          </CommandItem>
                        )}
                      </CommandCollection>
                    </CommandGroup>
                    <CommandSeparator />
                  </Fragment>
                )}
              </CommandList>
            </CommandPanel>
          </Command>
        </CommandDialogPopup>
      </CommandDialog>
    </>
  );
}
