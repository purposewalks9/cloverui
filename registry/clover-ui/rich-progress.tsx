"use client";

import * as React from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "motion/react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const richProgressVariants = cva("flex w-full max-w-xl flex-col gap-1.5 select-none", {
  variants: {
    color: {
      default: "text-foreground",
      blue: "text-blue-500",
      purple: "text-purple-500",
      pink: "text-pink-500",
      red: "text-red-600",
      orange: "text-orange-500",
      yellow: "text-yellow-500",
      green: "text-green-500",
      teal: "text-teal-500",
      cyan: "text-cyan-500",
      indigo: "text-indigo-500",
      violet: "text-violet-500",
      rose: "text-rose-500",
      amber: "text-amber-500",
      lime: "text-lime-500",
      sky: "text-sky-500",
      emerald: "text-emerald-500",
    },
  },
  defaultVariants: {
    color: "default",
  },
});

const knobVariants = cva(
  [
    "pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2",
    "bg-background dark:bg-foreground ring-border ring-1",
  ],
  {
    variants: {
      knob: {
        circle: "rounded-full shadow-md shadow-black/25",
        square: "rounded-none",
      },
      size: {
        sm: "size-3.5",
        default: "size-4.5",
        lg: "size-5",
      },
    },
    defaultVariants: {
      knob: "square",
      size: "default",
    },
  },
);

const trackHeights = { sm: "h-1", default: "h-1.5", lg: "h-2" } as const;

export type RichProgressColor = NonNullable<VariantProps<typeof richProgressVariants>["color"]>;

export type RichProgressSize = keyof typeof trackHeights;

export type RichProgressKnob = NonNullable<VariantProps<typeof knobVariants>["knob"]>;

export interface RichProgressProps {
  value: number;
  onChange?: (value: number) => void;
  label?: string;
  color?: RichProgressColor;
  size?: RichProgressSize;
  showValue?: boolean;
  valueLabel?: string;
  knob?: RichProgressKnob | boolean;
  className?: string;
  trackClassName?: string;
  fillClassName?: string;
}

const spring = { stiffness: 520, damping: 42, mass: 0.5 };

const RichProgress = ({
  value,
  onChange,
  label,
  color = "default",
  size = "default",
  showValue = true,
  valueLabel,
  knob = "square",
  className,
  trackClassName,
  fillClassName,
}: RichProgressProps) => {
  const reduceMotion = useReducedMotion();
  const clamped = Math.min(100, Math.max(0, value));
  const knobShape: RichProgressKnob | null =
    knob === true ? "square" : knob === false ? null : knob;

  const trackRef = React.useRef<HTMLDivElement>(null);
  const draggingRef = React.useRef(false);
  const [dragging, setDragging] = React.useState(false);

  const springValue = useSpring(clamped, spring);

  React.useEffect(() => {
    if (reduceMotion) springValue.jump(clamped);
    else springValue.set(clamped);
  }, [clamped, reduceMotion, springValue]);

  const width = useTransform(springValue, (v) => `${v}%`);

  const updateFromPointer = (clientX: number) => {
    const track = trackRef.current;
    if (!track || !onChange) return;
    const rect = track.getBoundingClientRect();
    if (rect.width === 0) return;
    const percentage = ((clientX - rect.left) / rect.width) * 100;
    onChange(Math.round(Math.min(100, Math.max(0, percentage))));
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const formattedValue = clamped.toFixed(2).replace(/\.?0+$/, "") || "0";
  const motionTransition = reduceMotion ? { duration: 0 } : { type: "spring" as const, ...spring };

  return (
    <div className={cn(richProgressVariants({ color }), className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between gap-3">
          {label && <span className="text-foreground text-sm font-medium">{label}</span>}
          {showValue && (
            <span
              className={cn(
                "text-muted-foreground ml-auto tabular-nums",
                size === "sm" ? "text-xs" : "text-sm",
              )}
            >
              {valueLabel ?? formattedValue}
            </span>
          )}
        </div>
      )}

      <div
        ref={trackRef}
        role={onChange ? "slider" : "progressbar"}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clamped)}
        aria-valuetext={valueLabel}
        aria-label={label}
        tabIndex={onChange ? 0 : undefined}
        onPointerDown={(event) => {
          if (!onChange || event.button !== 0) return;
          draggingRef.current = true;
          setDragging(true);
          event.currentTarget.setPointerCapture(event.pointerId);
          updateFromPointer(event.clientX);
        }}
        onPointerMove={(event) => {
          if (draggingRef.current) updateFromPointer(event.clientX);
        }}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={(event) => {
          if (!onChange) return;
          const moves: Record<string, number> = {
            ArrowRight: clamped + 1,
            ArrowUp: clamped + 1,
            ArrowLeft: clamped - 1,
            ArrowDown: clamped - 1,
            PageUp: clamped + 10,
            PageDown: clamped - 10,
            Home: 0,
            End: 100,
          };
          if (!(event.key in moves)) return;
          event.preventDefault();
          onChange(Math.min(100, Math.max(0, moves[event.key])));
        }}
        className={cn(
          "relative w-full touch-none py-2 outline-none",
          onChange && "cursor-pointer",
          "focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2",
        )}
      >
        <div className={cn("bg-foreground/10 relative w-full", trackHeights[size], trackClassName)}>
          <motion.div
            className={cn(
              "relative h-full overflow-hidden bg-current shadow-[inset_0_-1px_0_rgb(0_0_0/0.25)]",
              fillClassName,
            )}
            style={{ width }}
          >
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/45 to-white/0"
            />
          </motion.div>

          {knobShape && (
            <motion.div
              aria-hidden
              className={knobVariants({ knob: knobShape, size })}
              style={{ left: width }}
              animate={{ scale: dragging ? 1.2 : 1 }}
              transition={motionTransition}
            />
          )}
        </div>
      </div>
    </div>
  );
};

RichProgress.displayName = "RichProgress";

export { RichProgress, richProgressVariants, knobVariants };
