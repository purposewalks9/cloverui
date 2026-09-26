"use client";

import * as React from "react";
import { Pipette } from "lucide-react";
import { cn } from "@/lib/utils";

interface HSV {
  h: number;
  s: number;
  v: number;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function normalizeHex(hex: string): string {
  const m = hex.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(m)) {
    return `#${m
      .split("")
      .map((c) => c + c)
      .join("")}`.toLowerCase();
  }
  if (/^[0-9a-fA-F]{6}$/.test(m)) return `#${m}`.toLowerCase();
  return "#000000";
}

function hexToRgb(hex: string) {
  const clean = normalizeHex(hex).slice(1);
  const int = parseInt(clean, 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

function rgbToHex(r: number, g: number, b: number) {
  const toHex = (n: number) =>
    clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsv(r: number, g: number, b: number): HSV {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  return { h, s, v: max };
}

function hsvToRgb(h: number, s: number, v: number) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

function useDrag(onMove: (x: number, y: number, rect: DOMRect) => void) {
  const ref = React.useRef<HTMLDivElement>(null);

  const handlePointer = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      el.setPointerCapture(e.pointerId);
      const rect = el.getBoundingClientRect();
      onMove(e.clientX, e.clientY, rect);

      const move = (ev: PointerEvent) => onMove(ev.clientX, ev.clientY, rect);
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [onMove],
  );

  return { ref, handlePointer };
}

export function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const rgb = React.useMemo(() => hexToRgb(value || "#000000"), [value]);
  const hsv = React.useMemo(() => rgbToHsv(rgb.r, rgb.g, rgb.b), [rgb]);
  // Hue is kept in its own bit of state so dragging through fully
  // desaturated / black points (where hue can't be derived from RGB)
  // doesn't snap the hue slider back to 0.
  const [hue, setHue] = React.useState(hsv.h);
  const lastValue = React.useRef(value);
  if (lastValue.current !== value) {
    lastValue.current = value;
    if (Math.abs(hsv.h - hue) > 0.5 && (hsv.s > 0.02 && hsv.v > 0.02)) {
      setHue(hsv.h);
    }
  }

  const commit = React.useCallback(
    (next: HSV) => {
      const { r, g, b } = hsvToRgb(next.h, next.s, next.v);
      onChange(rgbToHex(r, g, b));
    },
    [onChange],
  );

  const sv = useDrag((x, y, rect) => {
    const s = clamp((x - rect.left) / rect.width, 0, 1);
    const v = clamp(1 - (y - rect.top) / rect.height, 0, 1);
    commit({ h: hue, s, v });
  });

  const hueDrag = useDrag((x, _y, rect) => {
    const h = clamp(((x - rect.left) / rect.width) * 360, 0, 359.99);
    setHue(h);
    commit({ h, s: hsv.s, v: hsv.v });
  });

  const [hexDraft, setHexDraft] = React.useState(value);
  React.useEffect(() => setHexDraft(value), [value]);

  function commitHexDraft(next: string) {
    setHexDraft(next);
    if (/^#?[0-9a-fA-F]{6}$/.test(next) || /^#?[0-9a-fA-F]{3}$/.test(next)) {
      onChange(normalizeHex(next));
    }
  }

  function setChannel(channel: "r" | "g" | "b", raw: string) {
    const n = clamp(Number(raw) || 0, 0, 255);
    const next = { ...rgb, [channel]: n };
    onChange(rgbToHex(next.r, next.g, next.b));
  }

  const canEyedrop =
    typeof window !== "undefined" && "EyeDropper" in window;

  async function pickFromScreen() {
    if (!canEyedrop) return;
    try {
      // @ts-expect-error -- EyeDropper isn't in the DOM lib typings yet.
      const dropper = new window.EyeDropper();
      const result = await dropper.open();
      if (result?.sRGBHex) onChange(normalizeHex(result.sRGBHex));
    } catch {
      // User cancelled the pick — nothing to do.
    }
  }

  const thumbColor = rgbToHex(rgb.r, rgb.g, rgb.b);

  return (
    <div className="flex w-full flex-col gap-3">
      <div
        ref={sv.ref}
        onPointerDown={sv.handlePointer}
        className="relative h-36 w-full touch-none rounded-md"
        style={{
          background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))`,
        }}
      >
        <span
          className="pointer-events-none absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
          style={{
            left: `${hsv.s * 100}%`,
            top: `${(1 - hsv.v) * 100}%`,
            background: thumbColor,
          }}
        />
      </div>

      <div className="flex items-center gap-2">
        <div
          ref={hueDrag.ref}
          onPointerDown={hueDrag.handlePointer}
          className="relative h-3 w-full touch-none rounded-full"
          style={{
            background:
              "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
          }}
        >
          <span
            className="pointer-events-none absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
            style={{
              left: `${(hue / 360) * 100}%`,
              background: `hsl(${hue}, 100%, 50%)`,
            }}
          />
        </div>

        {canEyedrop && (
          <button
            type="button"
            onClick={pickFromScreen}
            aria-label="Pick color from screen"
            title="Pick color from screen"
            className="flex size-7 shrink-0 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Pipette className="size-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span
          className="size-7 shrink-0 rounded-md border border-input"
          style={{ background: thumbColor }}
        />
        <input
          value={hexDraft}
          onChange={(e) => commitHexDraft(e.target.value)}
          onBlur={() => setHexDraft(value)}
          className={cn(
            "h-7 w-full min-w-0 rounded-md border border-input bg-transparent px-2",
            "font-mono text-xs text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring",
          )}
        />
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {(["r", "g", "b"] as const).map((channel) => (
          <label key={channel} className="flex flex-col gap-1">
            <input
              type="number"
              min={0}
              max={255}
              value={rgb[channel]}
              onChange={(e) => setChannel(channel, e.target.value)}
              className="h-7 w-full rounded-md border border-input bg-transparent px-1.5 text-center font-mono text-xs text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <span className="text-center text-[10px] uppercase text-muted-foreground">
              {channel}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
