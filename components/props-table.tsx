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

function PropRow({ item }: { item: PropsTableItem }) {
  const [open, setOpen] = useState(item.defaultOpen ?? true);
  const hasDetails = Boolean(item.description || item.default);

  return (
    <div className="border-t border-border first:border-t-0">
      <button
        type="button"
        onClick={() => hasDetails && setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center justify-between px-4 py-3 text-left",
          hasDetails && "cursor-pointer",
        )}
      >
        <code className="font-mono text-sm text-primary">
          {item.name}
          {item.optional && "?"}
        </code>
        <div className="flex items-center gap-3">
          <code className="font-mono text-sm text-foreground">
            {item.type}
          </code>
          {hasDetails && (
            <ChevronUp
              className={cn(
                "size-4 text-muted-foreground transition-transform",
                !open && "rotate-180",
              )}
            />
          )}
        </div>
      </button>

      {hasDetails && open && (
        <div className="px-4 pb-4 space-y-3">
          {item.description && (
            <p className="text-sm text-muted-foreground">
              {item.description}
            </p>
          )}
          {item.default && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Default</span>
              <code className="font-mono text-sm text-foreground">
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
      <div className="mt-6 flex h-[42px] w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/30">
        <div className="text-center text-sm text-muted-foreground">
          No Additional Props
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 w-full overflow-hidden rounded-lg border border-border not-prose">
      <div className="flex items-center justify-between bg-muted/30 px-4 py-3">
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