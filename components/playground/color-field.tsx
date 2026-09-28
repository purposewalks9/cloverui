"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ColorPicker } from "./color-picker";

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
        {bare ? (
          <button
            type="button"
            aria-label="Pick a color"
            className="h-6 w-full shrink-0 rounded-md border border-input ring-offset-background transition-all hover:scale-[1.03] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=open]:ring-2 data-[state=open]:ring-ring data-[state=open]:ring-offset-2"
            style={{ background: value }}
          />
        ) : (
          <button
            type="button"
            className="flex h-8 items-center gap-2 rounded-md border border-input px-2 text-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=open]:ring-2 data-[state=open]:ring-ring data-[state=open]:ring-offset-2"
          >
            <span
              className="size-4 shrink-0 rounded-full border border-black/10"
              style={{ background: value }}
            />
            <span className="font-mono">{value}</span>
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-3"
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
