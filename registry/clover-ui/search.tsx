"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowDown, ArrowUp, CornerDownLeft, Search as SearchIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  keywords?: string[];
  category?: string;
  shortcut?: string[];
  disabled?: boolean;
  onSelect?: () => void;
}

export interface SearchGroup {
  id: string;
  label: string;
  items: SearchItem[];
}

export interface SearchTriggerProps extends React.ComponentProps<"button"> {
  placeholder?: string;
  shortcutLabel?: string;
  compact?: boolean;
}

export function SearchTrigger({
  placeholder = "Search anything...",
  shortcutLabel,
  compact = false,
  className,
  ...props
}: SearchTriggerProps) {
  return (
    <button
      type="button"
      aria-label={placeholder}
      className={cn(
        "inline-flex h-11 min-w-0 cursor-pointer items-center gap-2.5 rounded-2xl border border-neutral-200/80 bg-neutral-100 p-1 text-sm text-neutral-500 shadow-[inset_0_1px_2px_rgb(0_0_0/0.04)] transition-colors hover:border-neutral-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none dark:border-neutral-700/70 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-neutral-600",
        compact ? "w-11 shrink-0" : "w-full max-w-80",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "flex h-full min-w-0 flex-1 items-center gap-2.5 rounded-xl bg-white px-2.5 dark:bg-neutral-950",
          compact && "justify-center px-0",
        )}
      >
        <SearchIcon aria-hidden className="size-4 shrink-0" strokeWidth={1.7} />
        {!compact && <span className="min-w-0 flex-1 truncate text-left">{placeholder}</span>}
        {!compact && shortcutLabel && (
          <kbd className="shrink-0 rounded-md bg-neutral-100 px-1.5 py-0.5 font-sans text-[11px] text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
            {shortcutLabel}
          </kbd>
        )}
      </span>
    </button>
  );
}

export interface SearchProps extends Omit<SearchTriggerProps, "onSelect" | "children"> {
  groups: SearchGroup[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (item: SearchItem) => void;
  onHighlight?: (item: SearchItem | null) => void;
  onQueryChange?: (query: string) => void;
  trigger?: React.ReactElement | null;
  title?: string;
  emptyMessage?: string;
  showCategories?: boolean;
  shortcut?: boolean;
  footer?: React.ReactNode;
  contentClassName?: string;
}

function Keycap({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-neutral-200/60 bg-white px-1 font-sans text-[10px] text-neutral-500 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-400">
      {children}
    </kbd>
  );
}

export function Search({
  groups,
  open,
  defaultOpen = false,
  onOpenChange,
  onSelect,
  onHighlight,
  onQueryChange,
  trigger,
  title = "Search",
  placeholder = "Search anything...",
  emptyMessage = "No results found. Try another search.",
  showCategories = true,
  shortcut = false,
  shortcutLabel,
  footer,
  contentClassName,
  disabled,
  ...triggerProps
}: SearchProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<string | null>(null);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const isOpen = open ?? internalOpen;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const lastHighlight = React.useRef<string | null | undefined>(undefined);
  const id = React.useId();
  const listId = `${id}-results`;
  const categories = React.useMemo(
    () => [
      ...new Set(
        groups.flatMap((group) =>
          group.items.map((item) => item.category).filter((value): value is string => !!value),
        ),
      ),
    ],
    [groups],
  );
  const activeCategory = showCategories && categories.includes(category ?? "") ? category : null;
  const filteredGroups = React.useMemo(() => {
    const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          const text = [
            item.label,
            item.description,
            group.label,
            item.category,
            ...(item.keywords ?? []),
          ]
            .join(" ")
            .toLocaleLowerCase();
          return (
            (!activeCategory || item.category === activeCategory) &&
            words.every((word) => text.includes(word))
          );
        }),
      }))
      .filter((group) => group.items.length);
  }, [groups, query, activeCategory]);
  const enabledItems = React.useMemo(
    () => filteredGroups.flatMap((group) => group.items).filter((item) => !item.disabled),
    [filteredGroups],
  );
  const activeItem = enabledItems.find((item) => item.id === activeId) ?? enabledItems[0] ?? null;
  const optionId = (item: SearchItem) => `${id}-item-${encodeURIComponent(item.id)}`;

  const changeOpen = React.useCallback(
    (next: boolean) => {
      if (next && disabled) return;
      if (open === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [disabled, open, onOpenChange],
  );

  React.useEffect(() => {
    if (!shortcut || disabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing || event.altKey) return;
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (target?.isContentEditable || target?.closest("input, textarea, select")) return;
      if (target?.closest("[role='dialog']") && !contentRef.current?.contains(target)) return;
      if (
        (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) ||
        (event.key === "/" && !event.metaKey && !event.ctrlKey)
      ) {
        event.preventDefault();
        changeOpen(!isOpen);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [shortcut, disabled, isOpen, changeOpen]);

  React.useEffect(() => {
    const viewport = window.visualViewport;
    if (!isOpen || !viewport) return;
    const update = () => {
      contentRef.current?.style.setProperty("--search-viewport-height", `${viewport.height}px`);
      contentRef.current?.style.setProperty("--search-viewport-top", `${viewport.offsetTop}px`);
    };
    const frame = requestAnimationFrame(update);
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      cancelAnimationFrame(frame);
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, [isOpen]);

  React.useEffect(() => {
    const next = isOpen ? (activeItem?.id ?? null) : null;
    if (lastHighlight.current === next) return;
    lastHighlight.current = next;
    onHighlight?.(isOpen ? activeItem : null);
  }, [activeItem, isOpen, onHighlight]);

  React.useEffect(() => {
    if (isOpen && activeItem)
      document
        .getElementById(`${id}-item-${encodeURIComponent(activeItem.id)}`)
        ?.scrollIntoView({ block: "nearest" });
  }, [activeItem, isOpen, id]);

  const select = (item: SearchItem) => {
    if (item.disabled) return;
    changeOpen(false);
    item.onSelect?.();
    onSelect?.(item);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={changeOpen}>
      {trigger !== null && (
        <Dialog.Trigger asChild>
          {trigger ?? (
            <SearchTrigger
              placeholder={placeholder}
              shortcutLabel={shortcutLabel ?? (shortcut ? "⌘ / Ctrl K" : undefined)}
              disabled={disabled}
              {...triggerProps}
            />
          )}
        </Dialog.Trigger>
      )}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-[3px] dark:bg-black/50" />
        <Dialog.Content
          ref={contentRef}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
          className={cn(
            "fixed top-[calc(var(--search-viewport-top,0px)+1rem)] left-1/2 z-[70] flex max-h-[calc(var(--search-viewport-height,100dvh)-2rem)] w-[calc(100%-1.5rem)] max-w-[480px] -translate-x-1/2 flex-col gap-2 rounded-[24px] border border-neutral-200/80 bg-neutral-100 p-2 text-neutral-800 shadow-[0_24px_80px_-24px_rgb(0_0_0/0.25)] outline-none sm:top-[calc(var(--search-viewport-top,0px)+var(--search-viewport-height,100dvh)*0.12)] sm:max-h-[calc(var(--search-viewport-height,100dvh)*0.76)] dark:border-neutral-700/70 dark:bg-neutral-900 dark:text-neutral-100",
            contentClassName,
          )}
        >
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          <Dialog.Description className="sr-only">
            Search and filter the list. Use the arrow keys to navigate and Enter to select.
          </Dialog.Description>
          <div className="flex min-h-12 shrink-0 items-center gap-2.5 rounded-2xl border border-neutral-200/50 bg-white pr-1.5 pl-3.5 dark:border-neutral-800 dark:bg-neutral-950">
            <SearchIcon
              aria-hidden
              className="size-4 shrink-0 text-neutral-400"
              strokeWidth={1.7}
            />
            <input
              ref={inputRef}
              role="combobox"
              aria-label={title}
              aria-expanded={isOpen}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={activeItem ? optionId(activeItem) : undefined}
              autoComplete="off"
              spellCheck={false}
              value={query}
              placeholder={placeholder}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveId(null);
                onQueryChange?.(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.nativeEvent.isComposing || event.altKey || event.metaKey || event.ctrlKey)
                  return;
                const index = enabledItems.findIndex((item) => item.id === activeItem?.id);
                if (["ArrowDown", "ArrowUp"].includes(event.key) && enabledItems.length) {
                  event.preventDefault();
                  const offset = event.key === "ArrowDown" ? 1 : -1;
                  setActiveId(
                    enabledItems[(index + offset + enabledItems.length) % enabledItems.length].id,
                  );
                } else if (event.key === "Enter" && activeItem) {
                  event.preventDefault();
                  select(activeItem);
                }
              }}
              className="h-12 w-full min-w-0 bg-transparent text-base outline-none placeholder:text-neutral-400 sm:text-sm dark:placeholder:text-neutral-500"
            />
            <Dialog.Close
              aria-label="Close search"
              className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl text-neutral-500 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-neutral-500 dark:hover:bg-neutral-800"
            >
              <X aria-hidden className="size-4" />
            </Dialog.Close>
          </div>
          {showCategories && categories.length > 0 && (
            <div
              role="group"
              aria-label="Search categories"
              className="flex shrink-0 gap-1 overflow-x-auto px-1 py-0.5"
            >
              {[null, ...categories].map((value) => (
                <button
                  key={value ?? "all"}
                  type="button"
                  aria-pressed={activeCategory === value}
                  onClick={() => {
                    setCategory(value);
                    setActiveId(null);
                    inputRef.current?.focus();
                  }}
                  className={cn(
                    "min-h-9 shrink-0 cursor-pointer rounded-lg px-3 text-xs whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-neutral-500 motion-reduce:transition-none",
                    activeCategory === value
                      ? "bg-white text-neutral-800 shadow-xs dark:bg-neutral-800 dark:text-neutral-100"
                      : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100",
                  )}
                >
                  {value ?? "All"}
                </button>
              ))}
            </div>
          )}
          <div
            id={listId}
            role="listbox"
            aria-label="Search results"
            className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-0.5 pb-0.5"
          >
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                role="group"
                aria-labelledby={`${id}-group-${encodeURIComponent(group.id)}`}
              >
                <div
                  id={`${id}-group-${encodeURIComponent(group.id)}`}
                  className="px-2 pt-1 pb-1.5 text-[11px] font-medium text-neutral-500 dark:text-neutral-400"
                >
                  {group.label}
                </div>
                <div className="rounded-2xl bg-white p-1 dark:bg-neutral-950/80">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      id={optionId(item)}
                      role="option"
                      aria-selected={activeItem?.id === item.id}
                      aria-disabled={item.disabled || undefined}
                      onPointerMove={() => {
                        if (!item.disabled) setActiveId(item.id);
                      }}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => select(item)}
                      className={cn(
                        "flex min-h-10 items-center gap-2.5 rounded-xl px-2 py-1.5 text-sm",
                        item.disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer",
                        activeItem?.id === item.id && "bg-neutral-100 dark:bg-neutral-800",
                      )}
                    >
                      {item.icon && (
                        <span
                          aria-hidden
                          className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 [&>svg]:size-4"
                        >
                          {item.icon}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{item.label}</span>
                        {item.description && (
                          <span className="block truncate text-xs text-neutral-500 dark:text-neutral-400">
                            {item.description}
                          </span>
                        )}
                      </span>
                      {item.shortcut && (
                        <span aria-hidden className="hidden shrink-0 gap-1 sm:flex">
                          {item.shortcut.map((key, index) => (
                            <Keycap key={`${key}-${index}`}>{key}</Keycap>
                          ))}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {!filteredGroups.length && (
              <div className="px-5 py-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
                {emptyMessage}
              </div>
            )}
          </div>
          <span role="status" className="sr-only">
            {filteredGroups.reduce((count, group) => count + group.items.length, 0)} results
          </span>
          <div className="flex min-h-9 shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-2xl border border-neutral-200/70 px-2.5 py-2 text-[10px] text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
            <div aria-hidden className="flex items-center gap-3">
              <span className="hidden items-center gap-1 sm:inline-flex">
                <Keycap>
                  <ArrowUp className="size-3" />
                </Keycap>
                <Keycap>
                  <ArrowDown className="size-3" />
                </Keycap>
                <span className="ml-0.5">Navigate</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Keycap>esc</Keycap>Close
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Keycap>
                  <CornerDownLeft className="size-3" />
                </Keycap>
                Select
              </span>
            </div>
            {footer}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
