"use client";

import * as React from "react";
import { AnimatePresence, animate, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

export type StatusFaceStatus = "great" | "good" | "ok" | "meh" | "bad";

export interface StatusFaceProps extends Omit<React.ComponentProps<"svg">, "color"> {
  status?: StatusFaceStatus;
  color?: string;
  blink?: boolean;
  label?: string;
}

type Pixel = [x: number, y: number];

const STATUS: Record<StatusFaceStatus, { color: string; label: string; mouth: Pixel[] }> = {
  great: {
    color: "#4fd15e",
    label: "Great",
    mouth: [
      [2, 7],
      [9, 7],
      [3, 8],
      [4, 8],
      [5, 8],
      [6, 8],
      [7, 8],
      [8, 8],
    ],
  },
  good: {
    color: "#2fc4b2",
    label: "Good",
    mouth: [
      [3, 7],
      [8, 7],
      [4, 8],
      [5, 8],
      [6, 8],
      [7, 8],
    ],
  },
  ok: {
    color: "#3f84f2",
    label: "OK",
    mouth: [
      [4, 8],
      [5, 8],
      [6, 8],
      [7, 8],
    ],
  },
  meh: {
    color: "#f5a524",
    label: "Meh",
    mouth: [
      [3, 8],
      [4, 7],
      [5, 7],
      [6, 8],
      [7, 8],
      [8, 7],
    ],
  },
  bad: {
    color: "#f83c3c",
    label: "Bad",
    mouth: [
      [3, 7],
      [4, 7],
      [5, 7],
      [6, 7],
      [7, 7],
      [8, 7],
      [2, 8],
      [9, 8],
    ],
  },
};

const FACE_ROWS: [from: number, to: number][] = [
  [3, 8],
  [1, 10],
  [0, 11],
  [0, 11],
  [0, 11],
  [0, 11],
  [0, 11],
  [0, 11],
  [0, 11],
  [0, 11],
  [1, 10],
  [3, 8],
];

const EYES: Pixel[] = [
  [4, 4],
  [7, 4],
];

const PIXEL_ORIGIN = { transformBox: "fill-box", transformOrigin: "center" } as const;

function StatusFace({
  status = "great",
  color,
  blink = true,
  label,
  className,
  style,
  ...props
}: StatusFaceProps) {
  const reduceMotion = useReducedMotion();
  const ref = React.useRef<SVGSVGElement>(null);
  const previous = React.useRef(status);
  const config = STATUS[status];
  const blinking = blink && !reduceMotion;

  React.useEffect(() => {
    if (previous.current === status) return;
    previous.current = status;
    if (!ref.current || reduceMotion) return;
    const controls = animate(
      ref.current,
      { scale: [1, 0.88, 1.05, 1] },
      { duration: 0.5, ease: "easeOut" },
    );
    return () => controls.stop();
  }, [status, reduceMotion]);

  return (
    <svg
      ref={ref}
      role="img"
      aria-label={label ?? config.label}
      viewBox="0 0 12 12"
      shapeRendering="crispEdges"
      className={cn("size-12 shrink-0 overflow-visible", className)}
      style={{ ...PIXEL_ORIGIN, ...style }}
      {...props}
    >
      <g
        className="transition-[fill] duration-300 ease-out"
        style={{ fill: color ?? config.color }}
      >
        {FACE_ROWS.map(([from, to], y) => (
          <rect key={y} x={from} y={y} width={to - from + 1} height={1.02} />
        ))}
      </g>

      <motion.g
        className="fill-neutral-950"
        style={PIXEL_ORIGIN}
        animate={blinking ? { scaleY: [1, 1, 0.1, 1] } : { scaleY: 1 }}
        transition={
          blinking
            ? { duration: 3.6, times: [0, 0.94, 0.97, 1], repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.1 }
        }
      >
        {EYES.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />
        ))}
      </motion.g>

      <g className="fill-neutral-950">
        <AnimatePresence initial={false}>
          {config.mouth.map(([x, y]) => (
            <motion.rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              style={PIXEL_ORIGIN}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0 }}
              transition={{
                duration: reduceMotion ? 0.15 : 0.22,
                delay: reduceMotion ? 0 : Math.abs(x - 5.5) * 0.03,
                ease: "easeOut",
              }}
            />
          ))}
        </AnimatePresence>
      </g>
    </svg>
  );
}

export { StatusFace };
