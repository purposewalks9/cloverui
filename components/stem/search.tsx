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
        "border-border bg-background text-foreground/75 hover:bg-accent hover:text-foreground focus-visible:outline-ring inline-flex h-9 min-w-0 cursor-pointer items-center gap-2 border px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
        compact ? "w-9 shrink-0 justify-center px-0" : "w-full max-w-60",
        className,
      )}
      {...props}
    >
      <SearchIcon aria-hidden className="size-4 shrink-0" strokeWidth={1.7} />
      {!compact && <span className="min-w-0 flex-1 truncate text-left">{placeholder}</span>}
      {!compact && shortcutLabel && (
        <kbd className="text-muted-foreground shrink-0 font-sans text-xs">{shortcutLabel}</kbd>
      )}
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
    <kbd className="bg-foreground/10 text-foreground/70 inline-flex h-6 min-w-6 items-center justify-center px-1 font-sans text-xs">
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
  const keyboardNavigation = React.useRef(false);
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
  const indexedGroups = React.useMemo(
    () =>
      groups.map((group) => ({
        ...group,
        entries: group.items.map((item) => ({
          item,
          text: [item.label, item.description, group.label, item.category, ...(item.keywords ?? [])]
            .join(" ")
            .toLocaleLowerCase(),
        })),
      })),
    [groups],
  );
  const filteredGroups = React.useMemo(() => {
    const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    return indexedGroups
      .map((group) => ({
        id: group.id,
        label: group.label,
        items: group.entries
          .filter(
            ({ item, text }) =>
              (!activeCategory || item.category === activeCategory) &&
              words.every((word) => text.includes(word)),
          )
          .map(({ item }) => item),
      }))
      .filter((group) => group.items.length);
  }, [indexedGroups, query, activeCategory]);
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

  const activeItemId = activeItem?.id;
  React.useEffect(() => {
    if (!isOpen || !activeItemId || !keyboardNavigation.current) return;
    keyboardNavigation.current = false;
    const option = document.getElementById(`${id}-item-${encodeURIComponent(activeItemId)}`);
    const list = document.getElementById(listId);
    if (!option || !list) return;
    const optionBounds = option.getBoundingClientRect();
    const listBounds = list.getBoundingClientRect();
    if (optionBounds.top < listBounds.top) list.scrollTop += optionBounds.top - listBounds.top;
    else if (optionBounds.bottom > listBounds.bottom)
      list.scrollTop += optionBounds.bottom - listBounds.bottom;
  }, [activeItemId, isOpen, id, listId]);

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
              shortcutLabel={shortcutLabel}
              disabled={disabled}
              {...triggerProps}
            />
          )}
        </Dialog.Trigger>
      )}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-md dark:bg-black/50" />
        <Dialog.Content
          ref={contentRef}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
          className={cn(
            "border-border bg-muted text-popover-foreground fixed top-[calc(var(--search-viewport-top,0px)+1rem)] left-1/2 z-[70] flex max-h-[calc(var(--search-viewport-height,100dvh)-2rem)] w-[calc(100%-1.5rem)] max-w-[560px] -translate-x-1/2 flex-col gap-2 border p-2 shadow-[0_24px_80px_-24px_rgb(0_0_0/0.25)] outline-none sm:top-[calc(var(--search-viewport-top,0px)+var(--search-viewport-height,100dvh)*0.12)] sm:max-h-[calc(var(--search-viewport-height,100dvh)*0.76)]",
            contentClassName,
          )}
        >
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          <Dialog.Description className="sr-only">
            Search and filter the list. Use the arrow keys to navigate and Enter to select.
          </Dialog.Description>
          <div className="bg-popover flex h-10 shrink-0 items-center gap-2.5 pr-0.5 pl-3">
            <SearchIcon
              aria-hidden
              className="text-muted-foreground size-4 shrink-0"
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
                keyboardNavigation.current = false;
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
                  keyboardNavigation.current = true;
                  const offset = event.key === "ArrowDown" ? 1 : -1;
                  setActiveId(
                    enabledItems[(index + offset + enabledItems.length) % enabledItems.length].id,
                  );
                } else if (event.key === "Enter" && activeItem) {
                  event.preventDefault();
                  select(activeItem);
                }
              }}
              className="placeholder:text-muted-foreground h-10 w-full min-w-0 bg-transparent text-base outline-none"
            />
            <Dialog.Close
              aria-label="Close search"
              className="text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-ring flex size-7 shrink-0 cursor-pointer items-center justify-center focus-visible:outline-2"
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
                    keyboardNavigation.current = false;
                    setCategory(value);
                    setActiveId(null);
                    inputRef.current?.focus();
                  }}
                  className={cn(
                    "focus-visible:outline-ring min-h-10 shrink-0 cursor-pointer px-3 text-sm whitespace-nowrap focus-visible:outline-2",
                    activeCategory === value
                      ? "bg-popover text-popover-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
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
                  className="text-muted-foreground px-2 pt-1 pb-1.5 text-[13px] font-medium"
                >
                  {group.label}
                </div>
                <div className="bg-popover p-1">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      id={optionId(item)}
                      role="option"
                      aria-selected={activeItem?.id === item.id}
                      aria-disabled={item.disabled || undefined}
                      onPointerEnter={(event) => {
                        if (event.pointerType === "touch" || item.disabled) return;
                        keyboardNavigation.current = false;
                        setActiveId(item.id);
                      }}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => select(item)}
                      className={cn(
                        "flex min-h-11 items-center gap-2.5 px-2.5 py-2 text-base",
                        item.disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer",
                        activeItem?.id === item.id && "bg-accent text-accent-foreground",
                      )}
                    >
                      {item.icon && (
                        <span
                          aria-hidden
                          className={cn(
                            "bg-muted text-muted-foreground flex size-7 shrink-0 items-center justify-center [&>svg]:size-4",
                            activeItem?.id === item.id && "text-[#a855f7] dark:text-[#c084fc]",
                          )}
                        >
                          {item.icon}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block truncate",
                            activeItem?.id === item.id && "sponsor-gradient w-fit max-w-full",
                          )}
                        >
                          {item.label}
                        </span>
                        {item.description && (
                          <span className="text-muted-foreground block truncate text-sm">
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
              <div className="text-muted-foreground px-5 py-12 text-center text-sm">
                {emptyMessage}
              </div>
            )}
          </div>
          <span role="status" className="sr-only">
            {filteredGroups.reduce((count, group) => count + group.items.length, 0)} results
          </span>
          <div className="text-muted-foreground flex min-h-10 shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 px-2 py-1 text-xs sm:text-sm">
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
