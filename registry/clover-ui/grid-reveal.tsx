"use client";

import { motion } from "motion/react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

export type GridRevealPattern = "random" | "wave" | "diagonal" | "center";

export interface GridRevealProps {
  children?: React.ReactNode;
  rows?: number;
  cols?: number;
  color?: string;
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

const GridReveal = forwardRef<GridRevealRef, GridRevealProps>(
  (
    {
      children,
      rows = 6,
      cols = 10,
      color = "#000000",
      blockDuration = 0.45,
      stagger = 0.03,
      duration,
      pattern = "random",
      loop = false,
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
    },
    ref,
  ) => {
    const [revealed, setRevealed] = useState(false);

    const hasPlayedRef = useRef(false);
    const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

    const count = rows * cols;

    const shuffled = useMemo(() => shuffledIndexes(count), [count]);

    const maxFactor = useMemo(() => {
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

    const perStepDelay = useMemo(
      () => (duration ? duration / (maxFactor + 1) : stagger),
      [duration, maxFactor, stagger],
    );

    const blocks = useMemo(() => {
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

    const clearTimers = useCallback(() => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    }, []);

    const cycleTime = maxFactor * perStepDelay + blockDuration;

    const play = useCallback(() => {
      clearTimers();

      const revealPhase = () => {
        setRevealed(true);
        onStart?.();

        const afterReveal = setTimeout(() => {
          onComplete?.();

          if (!loop) return;

          const afterPause = setTimeout(() => {
            setRevealed(false);

            const nextCycle = setTimeout(revealPhase, cycleTime * 1000 + loopDelay * 1000);

            timers.current.push(nextCycle);
          }, loopDelay * 1000);

          timers.current.push(afterPause);
        }, cycleTime * 1000);

        timers.current.push(afterReveal);
      };

      revealPhase();
    }, [clearTimers, loop, loopDelay, onComplete, onStart, cycleTime]);

    const cover = useCallback(() => {
      clearTimers();
      setRevealed(false);
    }, [clearTimers]);

    const reset = useCallback(() => {
      cover();
      hasPlayedRef.current = false;
    }, [cover]);

    useImperativeHandle(
      ref,
      () => ({
        play,
        cover,
        reset,
      }),
      [play, cover, reset],
    );

    useEffect(() => {
      if (autoStart && !inView) {
        hasPlayedRef.current = true;
        play();
      }

      return clearTimers;
    }, [autoStart, inView]);

    const handleViewportEnter = useCallback(() => {
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
                backgroundColor: color,
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
  },
);

GridReveal.displayName = "GridReveal";

export { GridReveal };
