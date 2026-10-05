"use client";

import * as React from "react";
import { AnimatePresence, animate, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

export type StatusFaceStatus = "great" | "good" | "ok" | "bad";

export interface StatusFaceProps extends Omit<React.ComponentProps<"svg">, "color"> {
  status?: StatusFaceStatus;
  color?: string;
  blink?: boolean;
  label?: string;
}

type Pixel = [x: number, y: number];

const STATUS: Record<StatusFaceStatus, { color: string; label: string; mouth: Pixel[] }> = {
  great: {
    color: "#22c55e",
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
    color: "#84cc16",
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
    color: "#f59e0b",
    label: "OK",
    mouth: [
      [4, 8],
      [5, 8],
      [6, 8],
      [7, 8],
    ],
  },
  bad: {
    color: "#ef4444",
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
  const eyesRef = React.useRef<SVGGElement>(null);
  const config = STATUS[status];
  const blinking = blink && !reduceMotion;

  React.useEffect(() => {
    const eyes = eyesRef.current;
    if (!eyes || !blinking) return;
    let timer = 0;
    let controls: ReturnType<typeof animate> | null = null;
    const schedule = () => {
      timer = window.setTimeout(
        () => {
          const twice = Math.random() < 0.2;
          controls = animate(
            eyes,
            { scaleY: twice ? [1, 0.1, 1, 0.1, 1] : [1, 0.1, 1] },
            { duration: twice ? 0.3 : 0.12, ease: "easeInOut" },
          );
          schedule();
        },
        2000 + Math.random() * 2500,
      );
    };
    schedule();
    return () => {
      window.clearTimeout(timer);
      controls?.stop();
      eyes.style.transform = "";
    };
  }, [blinking]);

  return (
    <svg
      role="img"
      aria-label={label ?? config.label}
      viewBox="0 0 12 12"
      shapeRendering="crispEdges"
      className={cn("size-12 shrink-0 overflow-visible", className)}
      style={style}
      {...props}
    >
      <g
        className="transition-[fill] duration-200 ease-in-out"
        style={{ fill: color ?? config.color }}
      >
        {FACE_ROWS.map(([from, to], y) => (
          <rect key={y} x={from} y={y} width={to - from + 1} height={1.02} />
        ))}
      </g>

      <g ref={eyesRef} className="fill-neutral-950" style={PIXEL_ORIGIN}>
        {EYES.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />
        ))}
      </g>

      <g className="fill-neutral-950">
        <AnimatePresence initial={false}>
          {config.mouth.map(([x, y]) => (
            <motion.rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            />
          ))}
        </AnimatePresence>
      </g>
    </svg>
  );
}

export { StatusFace };
