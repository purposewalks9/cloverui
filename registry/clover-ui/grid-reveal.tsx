"use client";

import { motion, useReducedMotion } from "motion/react";
import * as React from "react";

import { cn } from "@/lib/utils";

export type GridRevealPattern = "random" | "wave" | "diagonal" | "center";

export const GRID_REVEAL_COLORS = {
  yellow: "#fde047",
  red: "#f87171",
  blue: "#60a5fa",
  green: "#4ade80",
  white: "#ffffff",
  orange: "#fb923c",
  pink: "#f472b6",
  violet: "#a78bfa",
} as const;

export type GridRevealColor = keyof typeof GRID_REVEAL_COLORS;

export interface GridRevealProps {
  ref?: React.Ref<GridRevealRef>;
  children?: React.ReactNode;
  rows?: number;
  cols?: number;
  color?: GridRevealColor;
  blockDuration?: number;
  stagger?: number;
  duration?: number;
  pattern?: GridRevealPattern;
  loop?: boolean;
  loopDelay?: number;
  gap?: number;
  className?: string;
  gridClassName?: string;
  blockClassName?: string;
  autoStart?: boolean;
  inView?: boolean;
  once?: boolean;

  onStart?: () => void;
  onComplete?: () => void;
}

export interface GridRevealRef {
  play: () => void;
  cover: () => void;
  reset: () => void;
}

function shuffledIndexes(count: number) {
  let seed = 0x9e3779b9 ^ count;

  const random = () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;

    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);

    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const arr = Array.from({ length: count }, (_, index) => index);

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

function getDelayFactor(
  pattern: GridRevealPattern,
  row: number,
  col: number,
  rows: number,
  cols: number,
  shuffled: number[],
  index: number,
) {
  switch (pattern) {
    case "wave":
      return col;

    case "diagonal":
      return row + col;

    case "center": {
      const midRow = (rows - 1) / 2;
      const midCol = (cols - 1) / 2;

      return Math.hypot(row - midRow, col - midCol);
    }

    case "random":
    default:
      return shuffled[index];
  }
}

function GridReveal({
  ref,
  children,
  rows = 6,
  cols = 10,
  color = "yellow",
  blockDuration = 0.45,
  stagger = 0.03,
  duration,
  pattern = "random",
  loop = true,
  loopDelay = 0.6,
  gap = 0,
  className,
  gridClassName,
  blockClassName,
  autoStart = true,
  inView = false,
  once = true,
  onStart,
  onComplete,
}: GridRevealProps) {
  const [revealed, setRevealed] = React.useState(false);
  const reducedMotion = useReducedMotion();

  const hasPlayedRef = React.useRef(false);
  const callbacks = React.useRef({ onStart, onComplete });
  React.useEffect(() => {
    callbacks.current = { onStart, onComplete };
  }, [onStart, onComplete]);
  const timers = React.useRef(new Set<ReturnType<typeof setTimeout>>());
  const schedule = React.useCallback((callback: () => void, delay: number) => {
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      callback();
    }, delay);
    timers.current.add(timer);
  }, []);

  const count = rows * cols;

  const shuffled = React.useMemo(() => shuffledIndexes(count), [count]);

  const maxFactor = React.useMemo(() => {
    let max = 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const index = row * cols + col;

        const factor = getDelayFactor(pattern, row, col, rows, cols, shuffled, index);

        if (factor > max) {
          max = factor;
        }
      }
    }

    return max || 1;
  }, [pattern, rows, cols, shuffled]);

  const perStepDelay = React.useMemo(
    () => (duration ? duration / (maxFactor + 1) : stagger),
    [duration, maxFactor, stagger],
  );

  const blocks = React.useMemo(() => {
    const items: {
      key: string;
      factor: number;
    }[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const index = row * cols + col;

        const factor = getDelayFactor(pattern, row, col, rows, cols, shuffled, index);

        items.push({
          key: `${row}-${col}`,
          factor,
        });
      }
    }

    return items;
  }, [rows, cols, pattern, shuffled]);

  const clearTimers = React.useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current.clear();
  }, []);

  const cycleTime = maxFactor * perStepDelay + blockDuration;

  const play = React.useCallback(() => {
    clearTimers();

    const revealPhase = () => {
      setRevealed(true);
      callbacks.current.onStart?.();

      schedule(() => {
        callbacks.current.onComplete?.();

        if (!loop || reducedMotion) return;

        schedule(() => {
          setRevealed(false);

          schedule(revealPhase, cycleTime * 1000 + loopDelay * 1000);
        }, loopDelay * 1000);
      }, cycleTime * 1000);
    };

    revealPhase();
  }, [clearTimers, schedule, loop, reducedMotion, loopDelay, cycleTime]);

  const cover = React.useCallback(() => {
    clearTimers();
    setRevealed(false);
  }, [clearTimers]);

  const reset = React.useCallback(() => {
    cover();
    hasPlayedRef.current = false;
  }, [cover]);

  React.useImperativeHandle(
    ref,
    () => ({
      play,
      cover,
      reset,
    }),
    [play, cover, reset],
  );

  React.useEffect(() => {
    if (autoStart && !inView) {
      hasPlayedRef.current = true;
      play();
    }

    return clearTimers;
  }, [autoStart, inView, play, clearTimers]);

  const handleViewportEnter = React.useCallback(() => {
    if (once && hasPlayedRef.current) {
      return;
    }

    hasPlayedRef.current = true;
    play();
  }, [once, play]);

  return (
    <motion.div
      className={cn("relative cursor-pointer overflow-hidden", className)}
      viewport={{
        once,
        margin: "-10% 0px -10% 0px",
      }}
      onViewportEnter={inView ? handleViewportEnter : undefined}
    >
      {children && <div className="relative h-full w-full">{children}</div>}

      <div
        className={cn("absolute inset-0 grid", children && "pointer-events-none", gridClassName)}
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
          gap,
        }}
        aria-hidden="true"
      >
        {blocks.map((block) => (
          <motion.div
            key={block.key}
            className={blockClassName}
            style={{
              backgroundColor: GRID_REVEAL_COLORS[color] ?? GRID_REVEAL_COLORS.yellow,
            }}
            initial={false}
            animate={
              revealed
                ? {
                    opacity: 0,
                    scale: 0.85,
                  }
                : {
                    opacity: 1,
                    scale: 1,
                  }
            }
            transition={{
              duration: blockDuration,
              delay: revealed
                ? block.factor * perStepDelay
                : (maxFactor - block.factor) * perStepDelay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export { GridReveal };
