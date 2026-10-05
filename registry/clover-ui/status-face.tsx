"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, animate, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const statusFaceVariants = cva(
  "inline-flex items-center gap-4 rounded-2xl bg-(--tint) py-4 pr-7 pl-4 transition-colors duration-300",
  {
    variants: {
      status: {
        great:
          "[--face:#4fd15e] [--ink:#24a83a] [--tint:#edf9ee] dark:[--ink:#5ddc6c] dark:[--tint:rgb(79_209_94/0.12)]",
        ok: "[--face:#3f84f2] [--ink:#3a83e2] [--tint:#e7effb] dark:[--ink:#6ea6f5] dark:[--tint:rgb(63_132_242/0.14)]",
        attention:
          "[--face:#f83c3c] [--ink:#e23b3b] [--tint:#fde9e9] dark:[--ink:#ff6b6b] dark:[--tint:rgb(248_60_60/0.13)]",
      },
    },
    defaultVariants: { status: "great" },
  },
);

export type StatusFaceStatus = NonNullable<VariantProps<typeof statusFaceVariants>["status"]>;

export interface StatusFaceProps extends Omit<React.ComponentProps<"div">, "title"> {
  status?: StatusFaceStatus;
  title?: string;
  description?: string;
  blink?: boolean;
}

type Pixel = [x: number, y: number];

const COPY: Record<StatusFaceStatus, { title: string; description: string }> = {
  great: { title: "Doing Great!", description: "You are on the right track" },
  ok: { title: "Doing OK", description: "You're doing pretty well" },
  attention: { title: "Pay Attention!", description: "You're off track right now" },
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

const MOUTHS: Record<StatusFaceStatus, Pixel[]> = {
  great: [
    [2, 7],
    [9, 7],
    [3, 8],
    [4, 8],
    [5, 8],
    [6, 8],
    [7, 8],
    [8, 8],
  ],
  ok: [
    [4, 8],
    [5, 8],
    [6, 8],
    [7, 8],
  ],
  attention: [
    [3, 7],
    [4, 7],
    [5, 7],
    [6, 7],
    [7, 7],
    [8, 7],
    [2, 8],
    [9, 8],
  ],
};

const GLYPHS: Record<StatusFaceStatus, Pixel[]> = {
  great: [
    [4, 3],
    [3, 4],
    [5, 4],
    [2, 5],
    [6, 5],
  ],
  ok: [
    [2, 4],
    [3, 4],
    [4, 4],
    [5, 4],
    [6, 4],
  ],
  attention: [
    [2, 3],
    [6, 3],
    [3, 4],
    [5, 4],
    [4, 5],
  ],
};

function PixelFace({ status, blink }: { status: StatusFaceStatus; blink: boolean }) {
  const reduceMotion = useReducedMotion();
  const ref = React.useRef<SVGSVGElement>(null);
  const previous = React.useRef(status);

  React.useEffect(() => {
    if (previous.current === status || !ref.current || reduceMotion) {
      previous.current = status;
      return;
    }
    previous.current = status;
    const controls = animate(
      ref.current,
      { scale: [1, 0.9, 1.04, 1] },
      { duration: 0.45, ease: "easeOut" },
    );
    return () => controls.stop();
  }, [status, reduceMotion]);

  return (
    <svg
      ref={ref}
      aria-hidden
      viewBox="0 0 12 12"
      shapeRendering="crispEdges"
      className="size-12 shrink-0 overflow-visible"
    >
      <g className="fill-(--face) transition-[fill] duration-300">
        {FACE_ROWS.map(([from, to], y) => (
          <rect key={y} x={from} y={y} width={to - from + 1} height={1.02} />
        ))}
      </g>

      <motion.g
        className="fill-neutral-950"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        animate={blink && !reduceMotion ? { scaleY: [1, 1, 0.1, 1] } : { scaleY: 1 }}
        transition={
          blink && !reduceMotion
            ? { duration: 3.6, times: [0, 0.94, 0.97, 1], repeat: Infinity, ease: "easeInOut" }
            : undefined
        }
      >
        {EYES.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />
        ))}
      </motion.g>

      <g className="fill-neutral-950">
        <AnimatePresence initial={false}>
          {MOUTHS[status].map(([x, y]) => (
            <motion.rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
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

function StatusGlyph({ status }: { status: StatusFaceStatus }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 9 9"
      shapeRendering="crispEdges"
      className="size-[1.15em] shrink-0"
    >
      <circle
        cx={4.5}
        cy={4.5}
        r={4.5}
        shapeRendering="auto"
        className="fill-(--ink) transition-[fill] duration-300"
      />
      <g className="fill-white">
        {GLYPHS[status].map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />
        ))}
      </g>
    </svg>
  );
}

function StatusFace({
  status = "great",
  title,
  description,
  blink = true,
  className,
  ...props
}: StatusFaceProps) {
  const reduceMotion = useReducedMotion();
  const heading = title ?? COPY[status].title;
  const detail = description ?? COPY[status].description;
  const swap = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 6, filter: "blur(3px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        exit: { opacity: 0, y: -6, filter: "blur(3px)" },
      };

  return (
    <div role="status" className={cn(statusFaceVariants({ status }), className)} {...props}>
      <PixelFace status={status} blink={blink} />

      <div className="flex min-w-0 flex-col gap-0.5 text-base">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={heading}
            {...swap}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="text-foreground font-medium whitespace-nowrap"
          >
            {heading}
          </motion.span>
        </AnimatePresence>

        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={`${status}-${detail}`}
            {...swap}
            transition={{ duration: 0.25, delay: reduceMotion ? 0 : 0.05, ease: "easeOut" }}
            className="flex items-center gap-1.5 whitespace-nowrap text-(--ink) transition-colors duration-300"
          >
            <StatusGlyph status={status} />
            {detail}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

export { StatusFace, statusFaceVariants };
