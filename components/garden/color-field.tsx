"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { ColorPicker } from "@/components/garden/color-picker";
import { cn } from "@/lib/utils";

export function ColorField({
  value,
  onChange,
  bare = false,
}: {
  value: string;
  onChange: (value: string) => void;
  bare?: boolean;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Pick a color, current ${value}`}
          className={cn(
            "bg-muted hover:bg-accent focus-visible:ring-ring data-[state=open]:ring-ring flex h-9 cursor-pointer items-center gap-2.5 rounded-lg pr-2.5 pl-1.5 transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none data-[state=open]:ring-2",
            bare ? "w-full" : "w-fit",
          )}
        >
          <span
            className="size-6 shrink-0 rounded-md shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]"
            style={{ background: value }}
          />
          <span className="text-foreground font-mono text-xs uppercase">{value}</span>
          <ChevronDown className="text-muted-foreground ml-auto size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 rounded-2xl p-3"
        align="start"
        side="bottom"
        sideOffset={10}
        showArrow
      >
        <ColorPicker value={value} onChange={onChange} />
      </PopoverContent>
    </Popover>
  );
}
