"use client";

import * as React from "react";
import { motion, useAnimate, useInView, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

export type ClickyFrom = "left" | "right" | "top" | "bottom";
export type ClickyColor = "purple" | "pink" | "blue" | "emerald" | "orange" | "default";

const palette: Record<ClickyColor, { line: string; edge: string; from: string; to: string }> = {
  purple: { line: "#8b5cf6", edge: "#6d28d9", from: "#a855f7", to: "#ec4899" },
  pink: { line: "#ec4899", edge: "#be185d", from: "#f472b6", to: "#fb7185" },
  blue: { line: "#3b82f6", edge: "#1d4ed8", from: "#60a5fa", to: "#22d3ee" },
  emerald: { line: "#10b981", edge: "#047857", from: "#34d399", to: "#a3e635" },
  orange: { line: "#f97316", edge: "#c2410c", from: "#fb923c", to: "#facc15" },
  default: { line: "#52525b", edge: "#27272a", from: "#a1a1aa", to: "#71717a" },
};

export interface ClickyProps extends Omit<React.ComponentProps<"span">, "color"> {
  children: React.ReactNode;
  color?: ClickyColor;
  size?: number;
  from?: ClickyFrom;
  anchor?: { x: number; y: number };
  delay?: number;
  trail?: boolean;
  loop?: boolean;
  interval?: number;
  autoClick?: boolean;
}

const TIP = { x: 13, y: 2.5 };

const HAND =
  "M11 16V4.5a2 2 0 0 1 4 0V12a2 2 0 0 1 4 0v1a2 2 0 0 1 4 0v1a2 2 0 0 1 4 0v7c0 4.5-3 8-7.5 8h-3c-2.7 0-4.3-1-5.9-3l-5.2-6.4a1.9 1.9 0 0 1 2.8-2.6L11 19.5Z";

const PATHS: Record<ClickyFrom, { start: [number, number]; bend: [number, number] }> = {
  right: { start: [180, 90], bend: [150, -50] },
  left: { start: [-180, 90], bend: [-150, -50] },
  top: { start: [120, -140], bend: [-60, -120] },
  bottom: { start: [140, 150], bend: [-40, 140] },
};

function sampleArc(start: [number, number], bend: [number, number], steps = 16) {
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = (1 - t) * (1 - t);
    const b = 2 * (1 - t) * t;
    xs.push(a * start[0] + b * bend[0]);
    ys.push(a * start[1] + b * bend[1]);
  }
  return { xs, ys };
}

function Clicky({
  children,
  color = "purple",
  size = 40,
  from = "right",
  anchor = { x: 62, y: 58 },
  delay = 0.4,
  trail = true,
  loop = true,
  interval = 2.8,
  autoClick = false,
  className,
  ...props
}: ClickyProps) {
  const [scope, animate] = useAnimate<HTMLSpanElement>();
  const targetRef = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(scope, { once: true, amount: 0.6 });
  const reduceMotion = useReducedMotion();
  const colors = palette[color];
  const { start, bend } = PATHS[from];
  const gradientId = React.useId();

  React.useEffect(() => {
    if (!inView) return;
    let cancelled = false;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const running: { stop: () => void }[] = [];
    const wait = (seconds: number) =>
      new Promise<void>((resolve) => {
        const timer = setTimeout(() => {
          timers.delete(timer);
          resolve();
        }, seconds * 1000);
        timers.add(timer);
      });
    const soft = { type: "spring", stiffness: 380, damping: 22 } as const;

    async function press() {
      const target = targetRef.current;
      await Promise.all([
        animate("[data-hand]", { scale: 0.88, rotate: -4 }, { duration: 0.16, ease: "easeOut" }),
        target && animate(target, { scale: 0.97 }, { duration: 0.16, ease: "easeOut" }),
      ]);
      if (cancelled) return;
      animate(
        "[data-glow]",
        { scale: [0.4, 1.8], opacity: [0.55, 0] },
        { duration: 0.9, ease: "easeOut" },
      );
      if (autoClick) (target?.firstElementChild as HTMLElement | null)?.click();
      await Promise.all([
        animate("[data-hand]", { scale: 1, rotate: 0 }, soft),
        target && animate(target, { scale: 1 }, soft),
      ]);
    }

    async function run() {
      if (reduceMotion) {
        await animate("[data-cursor]", { opacity: 1, x: 0, y: 0 }, { duration: 0 });
        return;
      }
      await wait(delay);
      if (cancelled) return;
      const { xs, ys } = sampleArc(start, bend);
      const travel = { duration: 1.3, ease: [0.45, 0, 0.2, 1] } as const;
      if (trail) {
        animate("[data-trail]", { pathLength: [0, 1], opacity: [0, 0.9] }, travel).then(() =>
          animate("[data-trail]", { opacity: 0 }, { duration: 1.2, ease: "easeOut" }),
        );
      }
      await animate("[data-cursor]", { opacity: [0, 1, 1], x: xs, y: ys }, travel);
      if (cancelled) return;
      running.push(
        animate(
          "[data-bob]",
          { y: [0, -3, 0], rotate: [0, -2, 0] },
          { duration: 2, repeat: Infinity, ease: "easeInOut" },
        ),
      );
      while (!cancelled) {
        await press();
        if (!loop || cancelled) break;
        await wait(interval);
      }
    }

    run();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      running.forEach((animation) => animation.stop());
    };
  }, [inView, animate, autoClick, delay, interval, loop, reduceMotion, start, bend, trail]);

  const scale = size / 32;
  const tipX = TIP.x * scale;
  const tipY = TIP.y * scale;

  return (
    <span ref={scope} className={cn("relative inline-block", className)} {...props}>
      <span ref={targetRef} className="inline-block">
        {children}
      </span>

      <span
        aria-hidden
        className="pointer-events-none absolute z-10"
        style={{ left: `${anchor.x}%`, top: `${anchor.y}%` }}
      >
        {trail && (
          <svg className="absolute top-0 left-0 overflow-visible blur-[14px]" width="1" height="1">
            <defs>
              <linearGradient
                id={gradientId}
                gradientUnits="userSpaceOnUse"
                x1={start[0]}
                y1={start[1]}
                x2={0}
                y2={0}
              >
                <stop offset="0%" stopColor={colors.to} stopOpacity={0} />
                <stop offset="100%" stopColor={colors.from} />
              </linearGradient>
            </defs>
            <motion.path
              data-trail
              d={`M${start[0]} ${start[1]} Q${bend[0]} ${bend[1]} 0 0`}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth={26}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
            />
          </svg>
        )}

        <motion.span
          data-cursor
          initial={{ opacity: 0, x: start[0], y: start[1] }}
          className="absolute top-0 left-0 block"
        >
          <motion.span
            data-glow
            className="absolute size-12 rounded-full opacity-0 blur-md"
            style={{
              left: -24,
              top: -24,
              background: `radial-gradient(circle, ${colors.from}, ${colors.to} 60%, transparent 70%)`,
            }}
          />
          <span data-bob className="relative block" style={{ marginLeft: -tipX, marginTop: -tipY }}>
            <motion.svg
              data-hand
              viewBox="0 0 32 32"
              width={size}
              height={size}
              className="overflow-visible drop-shadow-[0_6px_10px_rgba(0,0,0,0.18)]"
              style={{ originX: `${(TIP.x / 32) * 100}%`, originY: "10%" }}
            >
              <path
                d={HAND}
                transform="translate(1.4 1.8)"
                fill={colors.edge}
                stroke={colors.edge}
                strokeWidth={1.6}
                strokeLinejoin="round"
              />
              <path
                d={HAND}
                fill="#ffffff"
                stroke={colors.line}
                strokeWidth={1.6}
                strokeLinejoin="round"
              />
              <path
                d="M15 12.5v4M19 13.5v3.5M23 14.5v3"
                stroke={colors.line}
                strokeWidth={1.4}
                strokeLinecap="round"
              />
            </motion.svg>
          </span>
        </motion.span>
      </span>
    </span>
  );
}

export { Clicky };
