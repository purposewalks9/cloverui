"use client";

import * as React from "react";
import { Check, Palette } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ColorPicker } from "@/components/playground/color-picker";
import { cn } from "@/lib/utils";

const PRESETS = [
  { name: "Lime", value: "#E1E900" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Violet", value: "#8B5CF6" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Pink", value: "#EC4899" },
] as const;

const STORAGE_KEY = "clover-ui-accent";

function foregroundFor(hex: string) {
  const clean = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return "#000000";
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.62 ? "#111111" : "#ffffff";
}

export function ColorSelector() {
  const [open, setOpen] = React.useState(false);
  const [color, setColor] = React.useState(PRESETS[0].value);

  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setColor(stored);
  }, []);

  React.useEffect(() => {
    const foreground = foregroundFor(color);
    document.documentElement.style.setProperty("--brand", color);
    document.documentElement.style.setProperty("--brand-foreground", foreground);
    document.documentElement.style.setProperty("--sidebar-primary", color);
    document.documentElement.style.setProperty("--sidebar-primary-foreground", foreground);
    document.documentElement.style.setProperty("--sidebar-accent", `color-mix(in srgb, ${color} 12%, var(--sidebar))`);
    document.documentElement.style.setProperty("--sidebar-accent-foreground", color);
    document.documentElement.style.setProperty("--ring", color);
    localStorage.setItem(STORAGE_KEY, color);
  }, [color]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Choose accent color"
          title="Accent color"
          className="inline-flex size-8 items-center justify-center rounded-md border border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span
            className="size-3.5 rounded-full border border-black/10 shadow-sm"
            style={{ backgroundColor: color }}
          />
          <span className="sr-only">Accent color</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-64 p-3">
        <div className="mb-3 flex items-center gap-2">
          <Palette className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">Accent color</span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {PRESETS.map((preset) => {
            const active = color.toLowerCase() === preset.value.toLowerCase();
            return (
              <button
                key={preset.value}
                type="button"
                aria-label={preset.name}
                title={preset.name}
                onClick={() => setColor(preset.value)}
                className={cn(
                  "relative flex size-9 items-center justify-center rounded-full border border-border outline-none",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                )}
                style={{ backgroundColor: preset.value }}
              >
                {active && <Check className="size-4" strokeWidth={2.5} style={{ color: foregroundFor(color) }} />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
