"use client";

import * as React from "react";
import { useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

export type GlitchTextTrigger = "auto" | "hover" | "always";

export interface GlitchTextProps extends Omit<React.ComponentProps<"span">, "children"> {
  children: string;
  trigger?: GlitchTextTrigger;
  interval?: number;
  duration?: number;
  colors?: [string, string];
  intensity?: number;
  scramble?: boolean;
}

const GLYPHS = "!<>-_\\/[]{}=+*^?#%&@$";
const FRAME = 40;

const random = (min: number, max: number) => min + Math.random() * (max - min);

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

function GlitchText({
  children,
  trigger = "auto",
  interval = 3000,
  duration = 450,
  colors = ["currentColor", "currentColor"],
  intensity = 1,
  scramble = true,
  className,
  onPointerEnter,
  onPointerLeave,
  ...props
}: GlitchTextProps) {
  const still = Boolean(useReducedMotion());
  const [glitched, setGlitched] = React.useState<{ from: string; text: string } | null>(null);
  const display = glitched?.from === children ? glitched.text : children;
  const [hovering, setHovering] = React.useState(false);
  const mainRef = React.useRef<HTMLSpanElement>(null);
  const redRef = React.useRef<HTMLSpanElement>(null);
  const blueRef = React.useRef<HTMLSpanElement>(null);

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
      });
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
  }, [active, bursts, children, duration, interval, intensity, scramble]);

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
        <span ref={redRef} className={layerClass} style={{ color: colors[0] }}>
          {display}
        </span>
        <span ref={blueRef} className={layerClass} style={{ color: colors[1] }}>
          {display}
        </span>
      </span>
    </span>
  );
}

export { GlitchText };
