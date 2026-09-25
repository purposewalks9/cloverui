"use client";

import { motion } from "motion/react";
import * as React from "react";

import { cn } from "@/lib/utils";

export type PuzzleBgPattern = "random" | "wave" | "diagonal" | "center";
/** in: pieces fly in and lock together. out: the finished puzzle breaks apart. */
export type PuzzleBgDirection = "in" | "out";

export interface PuzzleBgProps {
  children?: React.ReactNode;
  rows?: number;
  cols?: number;
  direction?: PuzzleBgDirection;
  /** Solid piece color. Used when there are no children and no image. */
  color?: string;
  /** Image url that gets cut into pieces. Used when there are no children. */
  image?: string;
  seamColor?: string;
  pattern?: PuzzleBgPattern;
  pieceDuration?: number;
  stagger?: number;
  duration?: number;
  knobSize?: number;
  scatter?: number;
  loop?: boolean;
  loopDelay?: number;
  autoStart?: boolean;
  className?: string;
  puzzleClassName?: string;
  pieceClassName?: string;
  onStart?: () => void;
  onComplete?: () => void;
}

export interface PuzzleBgRef {
  play: () => void;
  cover: () => void;
  reset: () => void;
}

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

type Phase = "home" | "away";

function seededRandom(seed: number) {
  let value = seed | 0;
  return () => {
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Shared knob directions: +1 pokes out of the piece above / left of the edge, -1 the other way. */
function createEdgeMap(rows: number, cols: number, seed: number) {
  const random = seededRandom(seed);
  const horizontal = Array.from({ length: Math.max(0, rows - 1) }, () =>
    Array.from({ length: cols }, () => (random() > 0.5 ? 1 : -1)),
  );
  const vertical = Array.from({ length: rows }, () =>
    Array.from({ length: Math.max(0, cols - 1) }, () => (random() > 0.5 ? 1 : -1)),
  );
  return { horizontal, vertical };
}

const n = (v: number) => Math.round(v * 100) / 100;

/**
 * One jigsaw edge from A to B with a round-headed knob in the middle.
 * `s` = 0 flat, +1 knob outward (clockwise winding, screen coords), -1 knob inward.
 * `k` is the knob unit in px so knobs stay circular on any aspect ratio.
 */
function edge(ax: number, ay: number, bx: number, by: number, s: number, k: number) {
  if (!s) return `L ${n(bx)} ${n(by)}`;
  const len = Math.hypot(bx - ax, by - ay);
  const ux = (bx - ax) / len;
  const uy = (by - ay) / len;
  const nx = uy * s; // outward normal for clockwise traversal
  const ny = -ux * s;
  const mid = len / 2;
  const p = (a: number, b: number) =>
    `${n(ax + ux * (mid + a * k) + nx * b * k)} ${n(ay + uy * (mid + a * k) + ny * b * k)}`;
  const sweep = s > 0 ? 1 : 0;

  return [
    `L ${p(-0.15, 0)}`,
    `C ${p(-0.09, 0)} ${p(-0.055, 0.02)} ${p(-0.055, 0.045)}`,
    `A ${n(0.12 * k)} ${n(0.12 * k)} 0 1 ${sweep} ${p(0.055, 0.045)}`,
    `C ${p(0.055, 0.02)} ${p(0.09, 0)} ${p(0.15, 0)}`,
    `L ${n(bx)} ${n(by)}`,
  ].join(" ");
}

function piecePath(piece: Piece, cw: number, ch: number, k: number) {
  const x0 = piece.col * cw;
  const y0 = piece.row * ch;
  const x1 = x0 + cw;
  const y1 = y0 + ch;

  return [
    `M ${n(x0)} ${n(y0)}`,
    edge(x0, y0, x1, y0, piece.top, k),
    edge(x1, y0, x1, y1, piece.right, k),
    edge(x1, y1, x0, y1, piece.bottom, k),
    edge(x0, y1, x0, y0, piece.left, k),
    "Z",
  ].join(" ");
}

function getFactor(
  pattern: PuzzleBgPattern,
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

const PuzzleBg = React.forwardRef<PuzzleBgRef, PuzzleBgProps>(
  (
    {
      children,
      rows = 4,
      cols = 5,
      direction = "in",
      color = "#E1E900",
      image,
      seamColor = "rgba(0,0,0,0.35)",
      pattern = "random",
      pieceDuration = 0.7,
      stagger = 0.06,
      duration,
      knobSize = 1.1,
      scatter = 1,
      loop = false,
      loopDelay = 1,
      autoStart = true,
      className,
      puzzleClassName,
      pieceClassName,
      onStart,
      onComplete,
    },
    ref,
  ) => {
    const rootRef = React.useRef<HTMLDivElement>(null);
    const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const rafRef = React.useRef<number | null>(null);
    const playRef = React.useRef<() => void>(() => {});

    const startPhase: Phase = direction === "in" ? "away" : "home";
    const endPhase: Phase = direction === "in" ? "home" : "away";

    const [state, setState] = React.useState<{ phase: Phase; instant: boolean }>({
      phase: startPhase,
      instant: true,
    });
    const [size, setSize] = React.useState({ w: 0, h: 0 });

    React.useLayoutEffect(() => {
      const el = rootRef.current;
      if (!el) return;
      const measure = () =>
        setSize((prev) =>
          prev.w === el.clientWidth && prev.h === el.clientHeight
            ? prev
            : { w: el.clientWidth, h: el.clientHeight },
        );
      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }, []);

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

    const pieces = React.useMemo<Piece[]>(
      () =>
        Array.from({ length: count }, (_, index) => {
          const row = Math.floor(index / cols);
          const col = index % cols;
          return {
            key: `${row}-${col}`,
            row,
            col,
            factor: getFactor(pattern, row, col, rows, cols, order, index),
            top: row === 0 ? 0 : -edges.horizontal[row - 1][col],
            bottom: row === rows - 1 ? 0 : edges.horizontal[row][col],
            left: col === 0 ? 0 : -edges.vertical[row][col - 1],
            right: col === cols - 1 ? 0 : edges.vertical[row][col],
          };
        }),
      [count, cols, edges, order, pattern, rows],
    );

    const maxFactor = React.useMemo(
      () => Math.max(...pieces.map((piece) => piece.factor), 1),
      [pieces],
    );

    const step = duration ? duration / maxFactor : stagger;
    const totalDuration = maxFactor * step + pieceDuration;

    const cw = size.w / cols;
    const ch = size.h / rows;
    const k = Math.min(cw, ch) * knobSize;

    const layout = React.useMemo(() => {
      if (!size.w || !size.h) return [];
      const reach = Math.max(size.w, size.h) * scatter;
      return pieces.map((piece, i) => {
        const random = seededRandom(i * 7919 + rows * 31 + cols * 17);
        const angle = random() * Math.PI * 2;
        const dist = (0.35 + random() * 0.55) * reach;
        return {
          d: piecePath(piece, cw, ch, k),
          origin: `${(piece.col + 0.5) * cw}px ${(piece.row + 0.5) * ch}px`,
          away: {
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist,
            rotate: (random() - 0.5) * 150,
            scale: 0.72 + random() * 0.2,
            opacity: 0,
          },
        };
      });
    }, [pieces, size.w, size.h, cw, ch, k, scatter, rows, cols]);

    const clearTimers = React.useCallback(() => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      timerRef.current = null;
      rafRef.current = null;
    }, []);

    const play = React.useCallback(() => {
      clearTimers();
      onStart?.();
      setState({ phase: startPhase, instant: true });

      rafRef.current = requestAnimationFrame(() => {
        setState({ phase: endPhase, instant: false });

        if (!loop) {
          timerRef.current = setTimeout(() => onComplete?.(), totalDuration * 1000);
          return;
        }

        // loop: hold the finished state, run it back, then go again
        timerRef.current = setTimeout(() => {
          onComplete?.();
          timerRef.current = setTimeout(() => {
            setState({ phase: startPhase, instant: false });
            timerRef.current = setTimeout(
              () => playRef.current(),
              (totalDuration + loopDelay) * 1000,
            );
          }, loopDelay * 1000);
        }, totalDuration * 1000);
      });
    }, [clearTimers, endPhase, loop, loopDelay, onComplete, onStart, startPhase, totalDuration]);

    playRef.current = play;

    const cover = React.useCallback(() => {
      clearTimers();
      setState({ phase: "home", instant: false });
    }, [clearTimers]);

    const reset = React.useCallback(() => {
      clearTimers();
      setState({ phase: startPhase, instant: true });
    }, [clearTimers, startPhase]);

    React.useImperativeHandle(ref, () => ({ play, cover, reset }), [cover, play, reset]);

    React.useEffect(() => {
      if (!autoStart) return;
      play();
      return clearTimers;
    }, [autoStart, clearTimers, play]);

    React.useEffect(() => clearTimers, [clearTimers]);

    const hasChildren = React.Children.count(children) > 0;
    const ready = layout.length > 0;
    // children fill the pieces: the real copy only sizes the box, the pieces draw it
    const sizerHidden = hasChildren && (ready || (direction === "in" && autoStart));
    const toHome = state.phase === "home";

    return (
      <div ref={rootRef} className={cn("relative overflow-hidden", className)}>
        {hasChildren && (
          <div
            className={cn("relative h-full w-full", sizerHidden && "pointer-events-none opacity-0")}
          >
            {children}
          </div>
        )}

        {ready && (
          <div
            aria-hidden="true"
            className={cn("pointer-events-none absolute inset-0", puzzleClassName)}
          >
            {pieces.map((piece, i) => {
              const { d, origin, away } = layout[i];
              const delay = piece.factor * step;

              return (
                <motion.div
                  key={piece.key}
                  className={cn("absolute left-0 top-0", pieceClassName)}
                  style={{
                    width: size.w,
                    height: size.h,
                    clipPath: `path("${d}")`,
                    transformOrigin: origin,
                    willChange: "transform, opacity",
                  }}
                  initial={
                    startPhase === "home"
                      ? { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }
                      : away
                  }
                  animate={toHome ? { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 } : away}
                  transition={
                    state.instant
                      ? { duration: 0 }
                      : {
                          delay,
                          duration: pieceDuration,
                          // snap in with a tiny overshoot, break away with a slow lift
                          ease: toHome ? [0.34, 1.3, 0.64, 1] : [0.55, 0, 0.8, 0.3],
                          opacity: {
                            delay: delay + (toHome ? 0 : pieceDuration * 0.45),
                            duration: pieceDuration * (toHome ? 0.35 : 0.55),
                            ease: "easeOut",
                          },
                        }
                  }
                >
                  {hasChildren ? (
                    <div className="relative h-full w-full">{children}</div>
                  ) : image ? (
                    <div
                      className="h-full w-full bg-cover bg-center"
                      style={{ backgroundImage: `url("${image}")` }}
                    />
                  ) : (
                    <div
                      className="h-full w-full"
                      style={{
                        backgroundColor: color,
                        backgroundImage:
                          "linear-gradient(135deg, rgba(255,255,255,0.22), rgba(0,0,0,0.12))",
                      }}
                    />
                  )}
                  <svg
                    className="absolute inset-0 h-full w-full"
                    width={size.w}
                    height={size.h}
                    fill="none"
                  >
                    <path d={d} stroke={seamColor} strokeWidth={1.6} />
                  </svg>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    );
  },
);

PuzzleBg.displayName = "PuzzleBg";

export { PuzzleBg };
