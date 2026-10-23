"use client";

import * as React from "react";
import { useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

export type GlitchyTextTrigger = "auto" | "hover" | "always";

export type GlitchyTextColor =
  | "default"
  | "red"
  | "blue"
  | "green"
  | "purple"
  | "orange"
  | "pink"
  | "yellow"
  | "teal"
  | "cyan"
  | "indigo"
  | "pixel";

export interface GlitchyTextProps extends Omit<React.ComponentProps<"span">, "children"> {
  children: string;
  trigger?: GlitchyTextTrigger;
  interval?: number;
  duration?: number;
  color?: GlitchyTextColor;
  colors?: [string, string];
  intensity?: number;
  scramble?: boolean;
}

const GLYPHS = "!<>-_\\/[]{}=+*^?#%&@$";
const FRAME = 40;
const BLOCKS = 14;
const PIXELS = [
  "#ef4444",
  "#f97316",
  "#facc15",
  "#22c55e",
  "#22d3ee",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
];

const PALETTES: Record<GlitchyTextColor, [string, string]> = {
  default: ["currentColor", "currentColor"],
  red: ["#ef4444", "#f43f5e"],
  blue: ["#3b82f6", "#22d3ee"],
  green: ["#22c55e", "#a3e635"],
  purple: ["#a855f7", "#d946ef"],
  orange: ["#f97316", "#facc15"],
  pink: ["#ec4899", "#fb7185"],
  yellow: ["#eab308", "#fde047"],
  teal: ["#14b8a6", "#5eead4"],
  cyan: ["#06b6d4", "#67e8f9"],
  indigo: ["#6366f1", "#a78bfa"],
  pixel: ["#ef4444", "#22d3ee"],
};

const random = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)];

function scrambled(text: string, amount: number) {
  const chars = Array.from(text);
  const spots = chars.map((char, index) => (char.trim() ? index : -1)).filter((i) => i >= 0);
  if (!spots.length) return text;
  const count = Math.max(1, Math.round(spots.length * amount));
  for (let n = 0; n < count; n++) {
    const spot = spots[Math.floor(Math.random() * spots.length)];
    chars[spot] = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
  }
  return chars.join("");
}

function GlitchyText({
  children,
  trigger = "auto",
  interval = 3000,
  duration = 450,
  color = "default",
  colors,
  intensity = 1,
  scramble = false,
  className,
  onPointerEnter,
  onPointerLeave,
  ...props
}: GlitchyTextProps) {
  const still = Boolean(useReducedMotion());
  const [glitched, setGlitched] = React.useState<{ from: string; text: string } | null>(null);
  const display = glitched?.from === children ? glitched.text : children;
  const [hovering, setHovering] = React.useState(false);
  const mainRef = React.useRef<HTMLSpanElement>(null);
  const redRef = React.useRef<HTMLSpanElement>(null);
  const blueRef = React.useRef<HTMLSpanElement>(null);
  const blocksRef = React.useRef<(HTMLSpanElement | null)[]>([]);
  const pixel = color === "pixel";
  const tint = pixel && !colors;
  const slices = colors ?? PALETTES[color] ?? PALETTES.default;

  const active = !still && (trigger === "always" || (trigger === "hover" && hovering));
  const bursts = !still && trigger === "auto";

  React.useEffect(() => {
    if (!active && !bursts) return;

    let frame = 0;
    let next = 0;
    let end = 0;
    let swing = 1;
    const layers = [redRef.current, blueRef.current];

    const reset = () => {
      layers.forEach((layer) => {
        if (!layer) return;
        layer.style.opacity = "0";
        layer.style.transform = "";
        layer.style.clipPath = "";
      });
      blocksRef.current.forEach((block) => {
        if (block) block.style.opacity = "0";
      });
      if (mainRef.current) mainRef.current.style.transform = "";
      setGlitched(null);
    };

    const tick = () => {
      const reach = 0.12 * intensity;
      swing = -swing;
      layers.forEach((layer, index) => {
        if (!layer) return;
        const top = random(0, 85);
        const height = random(6, 40);
        layer.style.opacity = String(index === 0 ? random(0.5, 0.8) : random(0.25, 0.5));
        layer.style.clipPath = `inset(${top}% 0 ${Math.max(0, 100 - top - height)}% 0)`;
        const side = index === 0 ? -1 : 1;
        layer.style.transform = `translate3d(${(side * random(0.3, 1) + swing * 0.6) * reach}em, ${random(-0.02, 0.02) * intensity}em, 0)`;
        if (tint) layer.style.color = pick(PIXELS);
      });
      if (pixel) {
        blocksRef.current.forEach((block) => {
          if (!block) return;
          if (Math.random() < 0.45) {
            block.style.opacity = "0";
            return;
          }
          const size = 0.12 * Math.max(0.5, intensity);
          block.style.left = `${random(-2, 98)}%`;
          block.style.top = `${random(0, 90)}%`;
          block.style.width = `${size * Math.ceil(random(0, 4))}em`;
          block.style.height = `${size * Math.ceil(random(0, 2))}em`;
          block.style.backgroundColor = pick(PIXELS);
          block.style.opacity = String(random(0.7, 1));
        });
      }
      if (mainRef.current) {
        const skew = Math.random() < 0.2 ? random(-8, 8) * intensity : 0;
        const shake = swing * random(0.04, 0.14) * intensity;
        mainRef.current.style.transform = `translate3d(${shake}em, 0, 0) skewX(${skew}deg)`;
      }
      if (scramble) {
        setGlitched({
          from: children,
          text: Math.random() < 0.55 ? scrambled(children, 0.12) : children,
        });
      }
    };

    const burst = () => {
      end = performance.now() + duration;
      const run = () => {
        if (performance.now() >= end) {
          reset();
          next = window.setTimeout(burst, interval * random(0.8, 1.2));
          return;
        }
        tick();
        frame = window.setTimeout(run, FRAME);
      };
      run();
    };

    if (active) {
      const loop = () => {
        tick();
        frame = window.setTimeout(loop, FRAME);
      };
      loop();
    } else {
      next = window.setTimeout(burst, interval * random(0.4, 1));
    }

    return () => {
      window.clearTimeout(frame);
      window.clearTimeout(next);
      reset();
    };
  }, [active, bursts, children, duration, interval, intensity, scramble, pixel, tint]);

  const layerClass =
    "pointer-events-none absolute inset-0 whitespace-pre-wrap opacity-0 will-change-transform select-none";

  return (
    <span
      className={cn("relative inline-block", className)}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        setHovering(true);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        setHovering(false);
      }}
      {...props}
    >
      <span className="sr-only">{children}</span>
      <span aria-hidden className="relative block">
        <span ref={mainRef} className="relative block whitespace-pre-wrap will-change-transform">
          {display}
        </span>
        <span ref={redRef} className={layerClass} style={{ color: slices[0] }}>
          {display}
        </span>
        <span ref={blueRef} className={layerClass} style={{ color: slices[1] }}>
          {display}
        </span>
        {pixel && (
          <span className="pointer-events-none absolute inset-0 select-none">
            {Array.from({ length: BLOCKS }, (_, index) => (
              <span
                key={index}
                ref={(block) => {
                  blocksRef.current[index] = block;
                }}
                className="absolute opacity-0"
              />
            ))}
          </span>
        )}
      </span>
    </span>
  );
}

export { GlitchyText };
