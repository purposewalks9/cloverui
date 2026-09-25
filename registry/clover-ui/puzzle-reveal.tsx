"use client";

import { motion } from "motion/react";
import * as React from "react";

import { cn } from "@/lib/utils";

export type PuzzleRevealPattern = "random" | "wave" | "diagonal" | "center";

export interface PuzzleRevealProps {
  children?: React.ReactNode;
  rows?: number;
  cols?: number;
  color?: string;
  pattern?: PuzzleRevealPattern;
  pieceDuration?: number;
  stagger?: number;
  duration?: number;
  pieceSize?: number;
  loop?: boolean;
  loopDelay?: number;
  autoStart?: boolean;
  className?: string;
  puzzleClassName?: string;
  pieceClassName?: string;
  onStart?: () => void;
  onComplete?: () => void;
}

export interface PuzzleRevealRef {
  play: () => void;
  cover: () => void;
  reset: () => void;
}

type EdgeMap = number[][];

type Piece = {
  key: string;
  row: number;
  col: number;
  factor: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
};

function seededRandom(seed: number) {
  let value = seed | 0;
  return () => {
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createEdgeMap(rows: number, cols: number, seed: number): {
  horizontal: EdgeMap;
  vertical: EdgeMap;
} {
  const random = seededRandom(seed);
  const horizontal = Array.from({ length: Math.max(0, rows - 1) }, () =>
    Array.from({ length: cols }, () => (random() > 0.5 ? 1 : -1)),
  );
  const vertical = Array.from({ length: rows }, () =>
    Array.from({ length: Math.max(0, cols - 1) }, () => (random() > 0.5 ? 1 : -1)),
  );

  return { horizontal, vertical };
}

function piecePath(top: number, right: number, bottom: number, left: number, depth: number) {
  const topPath = top ? `m 38 0 c 0 ${top * depth} 14 ${top * depth} 14 0 c 0 ${-top * depth} 14 ${-top * depth} 14 0` : "";
  const rightPath = right ? `v 38 c ${right * depth} 0 ${right * depth} 14 0 14 c ${-right * depth} 0 ${-right * depth} 14 0 14` : "";
  const bottomPath = bottom ? `h -38 c 0 ${bottom * depth} -14 ${bottom * depth} -14 0 c 0 ${-bottom * depth} -14 ${-bottom * depth} -14 0` : "h -38";
  const leftPath = left ? `v -38 c ${left * depth} 0 ${left * depth} -14 0 -14 c ${-left * depth} 0 ${-left * depth} -14 0 -14` : "v -38";

  return `M 0 0 H 38 ${topPath} H 100 V 38 ${rightPath} V 100 ${bottomPath} H 0 V 62 ${leftPath} Z`;
}

function getFactor(
  pattern: PuzzleRevealPattern,
  row: number,
  col: number,
  rows: number,
  cols: number,
  order: number[],
  index: number,
) {
  switch (pattern) {
    case "wave":
      return row * 0.45 + col;
    case "diagonal":
      return row + col;
    case "center": {
      const midRow = (rows - 1) / 2;
      const midCol = (cols - 1) / 2;
      return Math.hypot(row - midRow, col - midCol);
    }
    case "random":
    default:
      return order[index];
  }
}

const PuzzleReveal = React.forwardRef<PuzzleRevealRef, PuzzleRevealProps>(
  (
    {
      children,
      rows = 4,
      cols = 4,
      color = "#E1E900",
      pattern = "random",
      pieceDuration = 0.42,
      stagger = 0.055,
      duration,
      pieceSize = 14,
      loop = false,
      loopDelay = 0.7,
      autoStart = true,
      className,
      puzzleClassName,
      pieceClassName,
      onStart,
      onComplete,
    },
    ref,
  ) => {
    const [revealed, setRevealed] = React.useState(false);
    const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const count = Math.max(1, rows * cols);
    const order = React.useMemo(() => {
      const values = Array.from({ length: count }, (_, index) => index);
      const random = seededRandom(count * 97 + rows * 17 + cols * 31);
      for (let i = values.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [values[i], values[j]] = [values[j], values[i]];
      }
      return values;
    }, [count, rows, cols]);

    const edges = React.useMemo(
      () => createEdgeMap(rows, cols, rows * 193 + cols * 389),
      [rows, cols],
    );

    const pieces = React.useMemo<Piece[]>(() => {
      return Array.from({ length: count }, (_, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        const top = row === 0 ? 0 : -edges.horizontal[row - 1][col];
        const bottom = row === rows - 1 ? 0 : edges.horizontal[row][col];
        const left = col === 0 ? 0 : -edges.vertical[row][col - 1];
        const right = col === cols - 1 ? 0 : edges.vertical[row][col];

        return {
          key: `${row}-${col}`,
          row,
          col,
          factor: getFactor(pattern, row, col, rows, cols, order, index),
          top,
          right,
          bottom,
          left,
        };
      });
    }, [count, cols, edges, order, pattern, rows]);

    const maxFactor = React.useMemo(
      () => Math.max(...pieces.map((piece) => piece.factor), 1),
      [pieces],
    );

    const step = duration ? duration / maxFactor : stagger;
    const totalDuration = maxFactor * step + pieceDuration;

    const clearTimer = React.useCallback(() => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }, []);

    const play = React.useCallback(() => {
      clearTimer();
      onStart?.();
      setRevealed(false);
      requestAnimationFrame(() => setRevealed(true));

      if (loop) {
        timerRef.current = setTimeout(() => play(), (totalDuration + loopDelay) * 1000);
      } else {
        timerRef.current = setTimeout(() => onComplete?.(), totalDuration * 1000);
      }
    }, [clearTimer, loop, loopDelay, onComplete, onStart, totalDuration]);

    const cover = React.useCallback(() => {
      clearTimer();
      setRevealed(false);
    }, [clearTimer]);

    const reset = React.useCallback(() => {
      clearTimer();
      setRevealed(false);
    }, [clearTimer]);

    React.useImperativeHandle(ref, () => ({ play, cover, reset }), [cover, play, reset]);

    React.useEffect(() => {
      if (!autoStart) return;
      play();
      return clearTimer;
    }, [autoStart, clearTimer, play]);

    React.useEffect(() => clearTimer, [clearTimer]);

    return (
      <div className={cn("relative overflow-hidden", className)}>
        <div className="relative h-full w-full">{children}</div>

        <div
          aria-hidden="true"
          className={cn("pointer-events-none absolute inset-0 overflow-visible", puzzleClassName)}
        >
          {pieces.map((piece) => {
            const delay = piece.factor * step;
            const top = `${(piece.row / rows) * 100}%`;
            const left = `${(piece.col / cols) * 100}%`;
            const width = `${100 / cols}%`;
            const height = `${100 / rows}%`;

            return (
              <motion.svg
                key={piece.key}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className={cn("absolute overflow-visible", pieceClassName)}
                style={{
                  top,
                  left,
                  width,
                  height,
                  transformOrigin: "50% 50%",
                }}
                initial={{ opacity: 1, scale: 1, rotate: 0 }}
                animate={
                  revealed
                    ? { opacity: 0, scale: 0.82, rotate: piece.col % 2 === 0 ? -2 : 2 }
                    : { opacity: 1, scale: 1, rotate: 0 }
                }
                transition={{
                  duration: pieceDuration,
                  delay: revealed ? delay : 0,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <path d={piecePath(piece.top, piece.right, piece.bottom, piece.left, pieceSize)} fill={color} />
              </motion.svg>
            );
          })}
        </div>
      </div>
    );
  },
);

PuzzleReveal.displayName = "PuzzleReveal";

export { PuzzleReveal };
