"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

export function ColorField({
  value,
  onChange,
  bare = false,
}: {
  value: string;
  onChange: (value: string) => void;
  /** Render as a full-width swatch bar with no inline hex label (the caller shows it instead). */
  bare?: boolean;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {bare ? (
          <button
            type="button"
            aria-label="Pick a color"
            className="h-6 w-full shrink-0 rounded-md border border-input"
            style={{ background: value }}
          />
        ) : (
          <button
            type="button"
            className="flex h-8 items-center gap-2 rounded-md border border-input px-2 text-xs"
          >
            <span
              className="size-4 shrink-0 rounded-full border border-black/10"
              style={{ background: value }}
            />
            <span className="font-mono">{value}</span>
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-56 space-y-3" align="end">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Pick a color"
          className="h-24 w-full cursor-pointer rounded-md border border-input bg-transparent p-1"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-xs"
        />
      </PopoverContent>
    </Popover>
  );
}
