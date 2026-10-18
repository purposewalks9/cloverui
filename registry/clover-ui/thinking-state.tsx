"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type ThinkingStateKind =
  "thinking" | "analyzing" | "debugging" | "searching" | "building" | "pondering";

export type ThinkingStatePixel = "square" | "circle";

export type ThinkingStateStatus = "active" | "complete" | "error";

export interface ThinkingStateProps extends Omit<React.ComponentProps<"span">, "color"> {
  state?: ThinkingStateKind;
  status?: ThinkingStateStatus;
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

const STATUS_COLORS: Record<
  Exclude<ThinkingStateStatus, "active">,
  { light: string; dark: string }
> = {
  complete: { light: "#16a34a", dark: "#4ade80" },
  error: { light: "#dc2626", dark: "#f87171" },
};

const ERROR_CELLS = [6, 12, 18, 8, 16];

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
  status = "active",
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
  const levelsRef = React.useRef<Float32Array | null>(null);
  const preset = STATES[state] ?? STATES.thinking;
  const active = status === "active" || !(status in STATUS_COLORS);
  const tone = active ? preset : STATUS_COLORS[status as keyof typeof STATUS_COLORS];

  React.useEffect(() => {
    const levels = (levelsRef.current ??= new Float32Array(GRID * GRID));
    const apply = () => {
      cellsRef.current.forEach((cell, i) => {
        if (cell) cell.style.opacity = String(levels[i] < 0.05 ? 0 : levels[i]);
      });
    };

    const from = levels.slice();
    const begin = performance.now();
    let frame = 0;
    const ease = (t: number) => 1 - (1 - Math.min(1, Math.max(0, t))) ** 3;

    if (status === "error") {
      const target = new Float32Array(GRID * GRID);
      for (const i of ERROR_CELLS) target[i] = 1;
      if (reduceMotion) {
        levels.set(target);
        apply();
        return;
      }
      const settle = (now: number) => {
        const eased = ease((now - begin) / 320);
        for (let i = 0; i < levels.length; i++) {
          levels[i] = from[i] + (target[i] - from[i]) * eased;
        }
        apply();
        if (eased < 1) frame = requestAnimationFrame(settle);
      };
      frame = requestAnimationFrame(settle);
      return () => cancelAnimationFrame(frame);
    }

    if (!active) {
      if (reduceMotion) {
        levels.fill(0);
        apply();
        return;
      }
      const settle = (now: number) => {
        const eased = ease((now - begin) / 420);
        for (let i = 0; i < levels.length; i++) levels[i] = from[i] * (1 - eased);
        apply();
        if (eased < 1) frame = requestAnimationFrame(settle);
      };
      frame = requestAnimationFrame(settle);
      return () => cancelAnimationFrame(frame);
    }

    if (reduceMotion) {
      paint(state, 0.9, levels);
      apply();
      return;
    }

    const next = new Float32Array(GRID * GRID);
    const loop = (now: number) => {
      paint(state, ((now - begin) / 1000) * Math.max(0.1, speed), next);
      const mix = ease((now - begin) / 420);
      for (let i = 0; i < levels.length; i++) {
        levels[i] = from[i] + (next[i] - from[i]) * mix;
      }
      apply();
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [state, status, active, speed, reduceMotion]);

  const animateText = shimmer && !reduceMotion && active;
  const loopColors = color === "loop" && !reduceMotion && active;
  const fixed = color && color !== "loop" && status !== "error" ? color : undefined;
  const label = children ?? preset.label;
  const labelKey =
    typeof label === "string" || typeof label === "number" ? String(label) : `node-${state}`;
  const radius = pixel === "circle" ? 0.4 : 0.12;
  const labelRef = React.useRef<HTMLSpanElement | null>(null);
  const [labelWidth, setLabelWidth] = React.useState<number | null>(null);
  const measuredRef = React.useRef(false);

  React.useLayoutEffect(() => {
    const node = labelRef.current;
    if (!node) return;
    const measure = () => setLabelWidth(node.getBoundingClientRect().width);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [labelKey]);

  const glide = measuredRef.current && !reduceMotion;
  if (labelWidth !== null) measuredRef.current = true;

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
          "--thinking-light": fixed ?? tone.light,
          "--thinking-dark": fixed ?? tone.dark,
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
      <motion.span
        className="inline-grid"
        initial={false}
        animate={labelWidth === null ? undefined : { width: labelWidth }}
        transition={{ duration: glide ? 0.3 : 0, ease: [0.4, 0, 0.2, 1] }}
      >
        <AnimatePresence initial={false}>
          <motion.span
            key={labelKey}
            ref={(node: HTMLSpanElement | null) => {
              if (node) labelRef.current = node;
            }}
            initial={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: "0.35em", filter: "blur(2px)" }
            }
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: "-0.35em", filter: "blur(2px)" }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "text-foreground w-max justify-self-start whitespace-nowrap [grid-area:1/1]",
              animateText &&
                "[animation:thinking-state-shimmer_3s_ease-in-out_infinite] bg-[linear-gradient(90deg,var(--foreground)_0%,var(--foreground)_30%,var(--muted-foreground)_50%,var(--foreground)_70%,var(--foreground)_100%)] bg-[length:300%_100%] bg-clip-text text-transparent",
            )}
          >
            {label}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </span>
  );
}

ThinkingState.displayName = "ThinkingState";

export function thinkingStateColors(
  state: ThinkingStateKind,
  status: ThinkingStateStatus = "active",
): { light: string; dark: string } {
  if (status === "complete" || status === "error") return STATUS_COLORS[status];
  const { light, dark } = STATES[state] ?? STATES.thinking;
  return { light, dark };
}

export { ThinkingState };
