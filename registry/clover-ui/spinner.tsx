"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "motion/react";
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export interface SpinnerProps {
  color?: string;
  trackColor?: string;
  dots?: number;
  size?: number;
  dotSize?: number;
  duration?: number;
  tailLength?: number;
  interactive?: boolean;

  className?: string;
  dotClassName?: string;

  autoStart?: boolean;
}

export interface SpinnerRef {
  play: () => void;
  pause: () => void;
}

function parseColor(input: string): [number, number, number, number] {
  if (input.startsWith("#")) {
    let hex = input.slice(1);
    if (hex.length === 3)
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const a = hex.length >= 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
    return [r, g, b, a];
  }
  const m = input.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/,
  );
  if (m) {
    return [Number(m[1]), Number(m[2]), Number(m[3]), m[4] !== undefined ? Number(m[4]) : 1];
  }
  return [255, 255, 255, 1];
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function mixColors(c1: string, c2: string, t: number) {
  const a = parseColor(c1);
  const b = parseColor(c2);
  return `rgba(${Math.round(lerp(a[0], b[0], t))}, ${Math.round(lerp(a[1], b[1], t))}, ${Math.round(
    lerp(a[2], b[2], t),
  )}, ${Number(lerp(a[3], b[3], t).toFixed(3))})`;
}

function trailDistance(head: number, dotFraction: number) {
  return (((head - dotFraction) % 1) + 1) % 1;
}

const Spinner = forwardRef<SpinnerRef, SpinnerProps>(
  (
    {
      color = "#0B87DA",
      trackColor = "rgba(11, 135, 218, 0.15)",
      dots = 12,
      size = 24,
      dotSize,
      duration = 1.2,
      tailLength = 0.4,
      interactive = true,
      className,
      dotClassName,
      autoStart = true,
    },
    ref,
  ) => {
    const [running, setRunning] = useState(autoStart);
    const elapsed = useRef(0);
    const time = useMotionValue(0);

    const play = useCallback(() => setRunning(true), []);
    const pause = useCallback(() => setRunning(false), []);
    const toggle = useCallback(() => setRunning((r) => !r), []);
    useImperativeHandle(ref, () => ({ play, pause }), [play, pause]);

    useAnimationFrame((_, delta) => {
      if (!running) return;
      elapsed.current += delta / 1000;
      time.set(elapsed.current);
    });

    const resolvedDotSize = dotSize ?? size * 0.16;

    const dotData = useMemo(() => {
      return Array.from({ length: dots }, (_, i) => {
        const fraction = i / dots;
        const angle = fraction * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        const radius = (size - resolvedDotSize) / 2;
        return {
          key: i,
          fraction,
          x: Math.round(Math.cos(rad) * radius * 1000) / 1000,
          y: Math.round(Math.sin(rad) * radius * 1000) / 1000,
        };
      });
    }, [dots, size, resolvedDotSize]);

    return (
      <div
        className={cn(
          "relative inline-flex items-center justify-center select-none",
          interactive && "cursor-pointer",
          className,
        )}
        style={{ width: size, height: size }}
        role={interactive ? "button" : "status"}
        aria-label={running ? "Loading, playing" : "Loading, paused"}
        aria-pressed={interactive ? running : undefined}
        tabIndex={interactive ? 0 : undefined}
        onClick={interactive ? toggle : undefined}
        onKeyDown={
          interactive
            ? (e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  toggle();
                }
              }
            : undefined
        }
      >
        {dotData.map((dot) => (
          <SpinnerDot
            key={dot.key}
            time={time}
            fraction={dot.fraction}
            x={dot.x}
            y={dot.y}
            size={resolvedDotSize}
            color={color}
            trackColor={trackColor}
            duration={duration}
            tailLength={tailLength}
            running={running}
            className={dotClassName}
          />
        ))}
      </div>
    );
  },
);

Spinner.displayName = "Spinner";

interface SpinnerDotProps {
  time: MotionValue<number>;
  fraction: number;
  x: number;
  y: number;
  size: number;
  color: string;
  trackColor: string;
  duration: number;
  tailLength: number;
  running: boolean;
  className?: string;
}

function SpinnerDot({
  time,
  fraction,
  x,
  y,
  size,
  color,
  trackColor,
  duration,
  tailLength,
  running,
  className,
}: SpinnerDotProps) {
  const backgroundColor = useTransform(time, (t) => {
    const head = (t / duration) % 1;
    const brightness = Math.max(0, 1 - trailDistance(head, fraction) / tailLength);
    return mixColors(trackColor, color, brightness);
  });

  return (
    <motion.span
      className={cn("absolute top-1/2 left-1/2 rounded-full", className)}
      style={{
        width: size,
        height: size,
        x: x - size / 2,
        y: y - size / 2,
        backgroundColor: running ? backgroundColor : trackColor,
      }}
    />
  );
}

export { Spinner };
