"use client";

import * as React from "react";
import { motion, useAnimate, useInView, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

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
  anchor?: { x: number; y: number };
  delay?: number;
  loop?: boolean;
  interval?: number;
  autoClick?: boolean;
}

const TIP = { x: 13, y: 2.5 };

const HAND =
  "M11 16V4.5a2 2 0 0 1 4 0V12a2 2 0 0 1 4 0v1a2 2 0 0 1 4 0v1a2 2 0 0 1 4 0v7c0 4.5-3 8-7.5 8h-3c-2.7 0-4.3-1-5.9-3l-5.2-6.4a1.9 1.9 0 0 1 2.8-2.6L11 19.5Z";

function Clicky({
  children,
  color = "purple",
  size = 40,
  anchor = { x: 62, y: 58 },
  delay = 0.2,
  loop = true,
  interval = 2.4,
  autoClick = false,
  className,
  ref,
  ...props
}: ClickyProps) {
  const [scope, animate] = useAnimate<HTMLSpanElement>();
  React.useImperativeHandle(ref, () => scope.current, [scope]);
  const targetRef = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(scope, { once: true, amount: 0.6 });
  const reduceMotion = useReducedMotion();
  const colors = palette[color];

  React.useEffect(() => {
    if (!inView) return;
    let cancelled = false;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const wait = (seconds: number) =>
      new Promise<void>((resolve) => {
        const timer = setTimeout(() => {
          timers.delete(timer);
          resolve();
        }, seconds * 1000);
        timers.add(timer);
      });
    const quick = { duration: 0.12, ease: "easeOut" } as const;
    const release = { type: "spring", stiffness: 520, damping: 26 } as const;

    async function press() {
      const target = targetRef.current;
      await Promise.all([
        animate("[data-hand]", { scale: 0.86, rotate: -4 }, quick),
        target && animate(target, { scale: 0.97 }, quick),
      ]);
      if (cancelled) return;
      animate(
        "[data-glow]",
        { scale: [0.4, 1.8], opacity: [0.55, 0] },
        { duration: 0.7, ease: "easeOut" },
      );
      if (autoClick) (target?.firstElementChild as HTMLElement | null)?.click();
      await Promise.all([
        animate("[data-hand]", { scale: 1, rotate: 0 }, release),
        target && animate(target, { scale: 1 }, release),
      ]);
    }

    async function run() {
      await wait(reduceMotion ? 0 : delay);
      if (cancelled) return;
      await animate(
        "[data-cursor]",
        { opacity: 1, scale: 1 },
        reduceMotion ? { duration: 0 } : { duration: 0.18, ease: "easeOut" },
      );
      if (reduceMotion) return;
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
    };
  }, [inView, animate, autoClick, delay, interval, loop, reduceMotion]);

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
        <motion.span
          data-cursor
          initial={{ opacity: 0, scale: 0.6 }}
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
          <span className="relative block" style={{ marginLeft: -tipX, marginTop: -tipY }}>
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
