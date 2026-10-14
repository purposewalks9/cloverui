"use client";

import * as React from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type ThinkingStateKind =
  "thinking" | "analyzing" | "debugging" | "searching" | "building" | "pondering";

export type ThinkingStatePixel = "square" | "circle";

export interface ThinkingStateProps extends Omit<React.ComponentProps<"span">, "color"> {
  state?: ThinkingStateKind;
  color?: string;
  pixel?: ThinkingStatePixel;
  grid?: boolean;
  speed?: number;
  shimmer?: boolean;
}

const GRID = 5;
const CENTER = (GRID - 1) / 2;

const STATES: Record<ThinkingStateKind, { label: string; light: string; dark: string }> = {
  thinking: { label: "Thinking", light: "#16a34a", dark: "#4ade80" },
  analyzing: { label: "Analyzing", light: "#0284c7", dark: "#7dd3fc" },
  debugging: { label: "Debugging", light: "#2563eb", dark: "#60a5fa" },
  searching: { label: "Searching", light: "#7c3aed", dark: "#a78bfa" },
  building: { label: "Building", light: "#ea580c", dark: "#fb923c" },
  pondering: { label: "Pondering", light: "#db2777", dark: "#f472b6" },
};

const clamp = (value: number) => Math.min(1, Math.max(0, value));

const ROUND = Array.from(
  { length: GRID * GRID },
  (_, i) => Math.hypot((i % GRID) - CENTER, Math.floor(i / GRID) - CENTER) <= CENTER + 0.4,
);

const RING = (() => {
  const cells: number[] = [];
  for (let x = 0; x < GRID; x++) cells.push(x);
  for (let y = 1; y < GRID; y++) cells.push(y * GRID + GRID - 1);
  for (let x = GRID - 2; x >= 0; x--) cells.push((GRID - 1) * GRID + x);
  for (let y = GRID - 2; y >= 1; y--) cells.push(y * GRID);
  return cells;
})();

function paint(state: ThinkingStateKind, t: number, out: Float32Array) {
  out.fill(0);

  if (state === "thinking") {
    const head = (t * 12) % RING.length;
    RING.forEach((cell, index) => {
      const behind = (head - index + RING.length) % RING.length;
      out[cell] = clamp(1 - behind / 6);
    });
    return;
  }

  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const i = y * GRID + x;
      const dx = x - CENTER;
      const dy = y - CENTER;

      if (state === "searching") {
        let level = 0;
        for (let k = 0; k < 5; k++) {
          const at = t * 1.6 - k * 0.1;
          const px = CENTER + Math.sin(at * 1.3) * 1.8;
          const py = CENTER + Math.sin(at * 2.6) * 1.7;
          level = Math.max(level, clamp(1 - Math.hypot(x - px, y - py) / 0.8) * (1 - k / 5));
        }
        out[i] = level;
      } else if (state === "building") {
        const filled = (t * 8) % (GRID * GRID + 8);
        const order = (GRID - 1 - y) * GRID + (y % 2 ? GRID - 1 - x : x);
        const fade = filled > GRID * GRID ? clamp((GRID * GRID + 8 - filled) / 5) : 1;
        out[i] = order < filled - 1 ? 0.8 * fade : order < filled ? 1 : 0;
      } else if (state === "pondering") {
        const distance = Math.hypot(dx, dy);
        let level = 0;
        for (let k = 0; k < 3; k++) {
          const radius = (t * 1.8 + k * 1.15) % 3.4;
          level = Math.max(
            level,
            clamp(1 - Math.abs(distance - radius) / 0.55) * (1 - radius / 3.4),
          );
        }
        out[i] = level;
      } else if (state === "analyzing") {
        const distance = Math.hypot(dx, dy);
        const onRing = clamp(1 - Math.abs(distance - 1.8) / 0.7);
        const angle = Math.atan2(dy, dx);
        const sweep = (Math.cos(angle - t * 4) + 1) / 2;
        const echo = (Math.cos(angle - t * 4 + Math.PI) + 1) / 2;
        out[i] = onRing * Math.max(sweep ** 4, echo ** 6 * 0.6);
      } else if (state === "debugging") {
        const wave = ((t * 5) % 14) - 3;
        const diagonal = x + (GRID - 1 - y);
        out[i] = clamp(1 - Math.abs(diagonal - wave) / 2.4);
      }
    }
  }
}

const SHIMMER_CSS =
  "@keyframes thinking-state-shimmer{0%{background-position:100% 0}100%{background-position:-100% 0}}";

const loopKeyframes = (name: string, tone: "light" | "dark") => {
  const colors = Object.values(STATES).map((preset) => preset[tone]);
  const stops = [...colors, colors[0]]
    .map(
      (value, index, all) =>
        `${((index / (all.length - 1)) * 100).toFixed(2)}%{--thinking-color:${value}}`,
    )
    .join("");
  return `@keyframes ${name}{${stops}}`;
};

const LOOP_CSS = `@property --thinking-color{syntax:"<color>";inherits:true;initial-value:transparent}${loopKeyframes("thinking-state-loop-light", "light")}${loopKeyframes("thinking-state-loop-dark", "dark")}`;

function ThinkingState({
  state = "thinking",
  color,
  pixel = "square",
  grid = true,
  speed = 1,
  shimmer = true,
  className,
  children,
  style,
  ...props
}: ThinkingStateProps) {
  const reduceMotion = useReducedMotion();
  const cellsRef = React.useRef<(SVGRectElement | null)[]>([]);
  const preset = STATES[state] ?? STATES.thinking;

  React.useEffect(() => {
    const levels = new Float32Array(GRID * GRID);
    const apply = () => {
      cellsRef.current.forEach((cell, i) => {
        if (cell) cell.style.opacity = String(levels[i] < 0.05 ? 0 : levels[i]);
      });
    };

    if (reduceMotion) {
      paint(state, 0.9, levels);
      apply();
      return;
    }

    let frame = 0;
    const start = performance.now();
    const loop = (now: number) => {
      paint(state, ((now - start) / 1000) * Math.max(0.1, speed), levels);
      apply();
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [state, speed, reduceMotion]);

  const animateText = shimmer && !reduceMotion;
  const loopColors = color === "loop" && !reduceMotion;
  const fixed = color && color !== "loop" ? color : undefined;
  const radius = pixel === "circle" ? 0.4 : 0.12;

  return (
    <span
      role="status"
      className={cn(
        "inline-flex items-center gap-[0.45em] align-middle font-medium",
        "[--thinking-color:var(--thinking-light)] dark:[--thinking-color:var(--thinking-dark)]",
        loopColors &&
          "[animation:thinking-state-loop-light_7s_linear_infinite] dark:[animation-name:thinking-state-loop-dark]",
        className,
      )}
      style={
        {
          "--thinking-light": fixed ?? preset.light,
          "--thinking-dark": fixed ?? preset.dark,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {animateText && (
        <style href="thinking-state-shimmer" precedence="default">
          {SHIMMER_CSS}
        </style>
      )}
      {loopColors && (
        <style href="thinking-state-loop" precedence="default">
          {LOOP_CSS}
        </style>
      )}
      <svg aria-hidden viewBox={`0 0 ${GRID} ${GRID}`} className="size-[0.95em] shrink-0">
        {grid &&
          Array.from({ length: GRID * GRID }, (_, i) =>
            pixel === "circle" && !ROUND[i] ? null : (
              <rect
                key={i}
                x={(i % GRID) + 0.1}
                y={Math.floor(i / GRID) + 0.1}
                width={0.8}
                height={0.8}
                rx={radius}
                className="fill-muted-foreground opacity-20 dark:opacity-30"
              />
            ),
          )}
        {Array.from({ length: GRID * GRID }, (_, i) =>
          pixel === "circle" && !ROUND[i] ? null : (
            <rect
              key={`lit-${i}`}
              ref={(node) => {
                cellsRef.current[i] = node;
              }}
              x={(i % GRID) + 0.1}
              y={Math.floor(i / GRID) + 0.1}
              width={0.8}
              height={0.8}
              rx={radius}
              className="fill-(--thinking-color)"
              opacity={0}
            />
          ),
        )}
      </svg>
      <span
        className={cn(
          "text-foreground whitespace-nowrap",
          animateText &&
            "[animation:thinking-state-shimmer_3s_ease-in-out_infinite] bg-[linear-gradient(90deg,var(--foreground)_0%,var(--foreground)_30%,var(--muted-foreground)_50%,var(--foreground)_70%,var(--foreground)_100%)] bg-[length:300%_100%] bg-clip-text text-transparent",
        )}
      >
        {children ?? preset.label}
      </span>
    </span>
  );
}

ThinkingState.displayName = "ThinkingState";

export { ThinkingState };
