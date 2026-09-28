"use client";

import { useState } from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface PropsTableItem {
  name: string;
  optional?: boolean;
  type: string;
  default?: string;
  description?: React.ReactNode;
  defaultOpen?: boolean;
}

interface PropsTableProps {
  data: PropsTableItem[];
}

function splitUnion(type: string): string[] | null {
  if (!type.includes(" | ")) return null;
  const parts = type.split(" | ").map((p) => p.trim());
  return parts.length > 1 ? parts : null;
}

const COLLAPSE_THRESHOLD = 4;

function TypePill({ children }: { children: React.ReactNode }) {
  return (
    <code className="whitespace-nowrap rounded-sm bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
      {children}
    </code>
  );
}

function PropRow({ item }: { item: PropsTableItem }) {
  const union = splitUnion(item.type);
  const isLongUnion = Boolean(union && union.length > COLLAPSE_THRESHOLD);
  const hasDetails = Boolean(item.description || item.default || isLongUnion);

  const [open, setOpen] = useState(
    isLongUnion ? false : item.defaultOpen ?? true,
  );

  return (
    <div className="border-t border-border first:border-t-0">
      <button
        type="button"
        onClick={() => hasDetails && setOpen((o) => !o)}
        className={cn(
          "flex w-full items-start justify-between gap-3 px-4 py-3 text-left",
          hasDetails && "cursor-pointer",
        )}
      >
        <code className="shrink-0 font-mono text-sm text-primary">
          {item.name}
          {item.optional && "?"}
        </code>
        <div className="flex min-w-0 items-center gap-3">
          {union ? (
            isLongUnion ? (
              <span className="whitespace-nowrap text-xs text-muted-foreground">
                {union.length} options
              </span>
            ) : (
              <div className="flex flex-wrap justify-end gap-1">
                {union.map((member) => (
                  <TypePill key={member}>{member}</TypePill>
                ))}
              </div>
            )
          ) : (
            <code className="whitespace-normal break-words text-right font-mono text-sm text-foreground">
              {item.type}
            </code>
          )}
          {hasDetails && (
            <ChevronUp
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform",
                !open && "rotate-180",
              )}
            />
          )}
        </div>
      </button>

      {hasDetails && open && (
        <div className="px-4 pb-4 space-y-3">
          {isLongUnion && union && (
            <div className="flex flex-wrap gap-1">
              {union.map((member) => (
                <TypePill key={member}>{member}</TypePill>
              ))}
            </div>
          )}
          {item.description && (
            <p className="text-sm text-muted-foreground">
              {item.description}
            </p>
          )}
          {item.default && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Default</span>
              <code className="whitespace-normal break-words text-right font-mono text-sm text-foreground">
                {item.default}
              </code>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function PropsTable({ data }: PropsTableProps) {
  if (data.length === 0) {
    return (
      <div className="mt-6 flex h-[42px] w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
        <div className="text-center text-sm text-muted-foreground">
          No Additional Props
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 w-full overflow-hidden rounded-lg border border-border not-prose">
      <div className="flex items-center justify-between bg-muted px-4 py-3">
        <span className="text-sm font-medium text-muted-foreground">
          Prop
        </span>
        <span className="text-sm font-medium text-muted-foreground">
          Type
        </span>
      </div>
      {data.map((item) => (
        <PropRow key={item.name} item={item} />
      ))}
    </div>
  );
}