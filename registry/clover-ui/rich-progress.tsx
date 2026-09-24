"use client";

import * as React from "react";
import { motion, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

type Color =
  | "default"
  | "blue"
  | "purple"
  | "pink"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "teal"
  | "cyan"
  | "indigo"
  | "violet"
  | "rose"
  | "amber"
  | "lime"
  | "sky"
  | "emerald";

type SizeVariant = "sm" | "default" | "lg";

export interface RichProgressProps {
  value: number;
  onChange?: (value: number) => void;
  label?: string;
  color?: Color;
  size?: SizeVariant;
  showValue?: boolean;
  valueLabel?: string;
  knob?: boolean;
  className?: string;
  trackClassName?: string;
  fillClassName?: string;
}

const fillColorMap: Record<Color, string> = {
  default: "bg-white dark:bg-zinc-100",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
  red: "bg-red-600",
  orange: "bg-orange-500",
  yellow: "bg-yellow-500",
  green: "bg-green-500",
  teal: "bg-teal-500",
  cyan: "bg-cyan-500",
  indigo: "bg-indigo-500",
  violet: "bg-violet-500",
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  lime: "bg-lime-500",
  sky: "bg-sky-500",
  emerald: "bg-emerald-500",
};

const sizeMap: Record<SizeVariant, { h: string; knob: string; text: string }> = {
  sm: { h: "h-1", knob: "size-3.5", text: "text-xs" },
  default: { h: "h-1.5", knob: "size-4.5", text: "text-sm" },
  lg: { h: "h-2", knob: "size-5", text: "text-sm" },
};

const RichProgress = ({
  value,
  onChange,
  label,
  color = "default",
  size = "default",
  showValue = true,
  valueLabel,
  knob = true,
  className,
  trackClassName,
  fillClassName,
}: RichProgressProps) => {
  const clamped = Math.min(100, Math.max(0, value));
  const { h, knob: knobSize, text } = sizeMap[size] ?? sizeMap.default;

  const trackRef = React.useRef<HTMLDivElement>(null);
  const dragging = React.useRef(false);

  const springValue = useSpring(clamped, {
    stiffness: 220,
    damping: 26,
    mass: 0.4,
  });

  const width = useTransform(springValue, (v) => `${v}%`);

  React.useEffect(() => {
    springValue.set(clamped);
  }, [clamped, springValue]);

  const updateFromPointer = React.useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return;

      const rect = track.getBoundingClientRect();
      const percentage = ((clientX - rect.left) / rect.width) * 100;
      const next = Math.round(Math.min(100, Math.max(0, percentage)));

      onChange?.(next);
    },
    [onChange]
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromPointer(event.clientX);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    updateFromPointer(event.clientX);
  };
  const formattedValue = clamped.toFixed(2).replace(/\.?0+$/, "") || "0";

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div className={cn("w-full max-w-xl flex flex-col gap-2", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-sm font-medium text-foreground">
              {label}
            </span>
          )}
          {showValue && (
            <span className={cn("tabular-nums text-muted-foreground", text)}>
              {valueLabel ?? formattedValue}
            </span>
          )}
        </div>
      )}

      <div
        ref={trackRef}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clamped)}
        aria-label={label}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          dragging.current = false;
        }}
        onKeyDown={(event) => {
          if (!onChange) return;

          if (event.key === "ArrowRight" || event.key === "ArrowUp") {
            event.preventDefault();
            onChange(Math.min(100, clamped + 1));
          }
          if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
            event.preventDefault();
            onChange(Math.max(0, clamped - 1));
          }
          if (event.key === "Home") {
            event.preventDefault();
            onChange(0);
          }
          if (event.key === "End") {
            event.preventDefault();
            onChange(100);
          }
        }}
        className={cn(
          "relative w-full cursor-pointer touch-none select-none",
          "rounded-full bg-zinc-700/70 dark:bg-zinc-700",
          h,
          trackClassName
        )}
      >
        <motion.div
          className={cn(
            "h-full rounded-full",
            fillColorMap[color],
            fillClassName
          )}
          style={{ width }}
        />

        {knob && (
          <motion.div
            aria-hidden
            className={cn(
              "pointer-events-none absolute top-1/2",
              "-translate-x-1/2 -translate-y-1/2",
              "rounded-full bg-white",
              "shadow-md shadow-black/30",
              "ring-1 ring-black/10",
              "transition-transform",
              dragging.current && "scale-110",
              knobSize
            )}
            style={{ left: width }}
          />
        )}
      </div>
    </div>
  );
};

RichProgress.displayName = "RichProgress";

export { RichProgress };