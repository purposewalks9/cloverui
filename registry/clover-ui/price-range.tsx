"use client";

import * as React from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "motion/react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const priceRangeVariants = cva("w-full max-w-md px-6 select-none", {
  variants: {
    color: {
      default: "text-primary",
      indigo: "text-indigo-500",
      blue: "text-blue-500",
      emerald: "text-emerald-500",
      rose: "text-rose-500",
      amber: "text-amber-500",
    },
  },
  defaultVariants: {
    color: "default",
  },
});

const knobVariants = cva(
  [
    "absolute top-8 -translate-x-1/2 -translate-y-1/2 outline-none",
    "focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2",
    "before:absolute before:-inset-2.5 before:content-['']",
    "disabled:after:bg-background/30 disabled:after:pointer-events-none disabled:after:absolute disabled:after:rounded-[inherit] disabled:after:content-['']",
  ],
  {
    variants: {
      knob: {
        circle:
          "bg-background dark:bg-foreground ring-border size-5 rounded-full shadow-md ring-1 shadow-black/15 disabled:after:inset-0",
        ring: "bg-background size-5 rounded-full border-[3px] border-current shadow-md shadow-black/15 disabled:after:-inset-[3px]",
        pill: "bg-background dark:bg-foreground ring-border h-6 w-3 rounded-full shadow-md ring-1 shadow-black/15 disabled:after:inset-0",
        line: "h-5 w-1 rounded-full bg-current disabled:after:inset-0",
      },
    },
    defaultVariants: {
      knob: "circle",
    },
  },
);

export type PriceRangeKnob = NonNullable<VariantProps<typeof knobVariants>["knob"]>;

export type PriceRangeColor = NonNullable<VariantProps<typeof priceRangeVariants>["color"]>;

export type PriceRangeValue = [number, number];

export interface PriceRangeProps extends Omit<
  React.ComponentProps<"div">,
  "defaultValue" | "onChange" | "color" | "children"
> {
  value?: PriceRangeValue;
  defaultValue?: PriceRangeValue;
  onValueChange?: (value: PriceRangeValue) => void;
  min?: number;
  max?: number;
  currency?: string;
  formatValue?: (value: number) => string;
  ticks?: number;
  showTicks?: boolean;
  color?: PriceRangeColor;
  knob?: PriceRangeKnob;
  disabled?: boolean;
}

const spring = { stiffness: 520, damping: 42, mass: 0.5 };

function clamp(value: number, low: number, high: number) {
  return Math.min(high, Math.max(low, value));
}

function niceStep(span: number) {
  const rough = span / 200;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const ratio = rough / magnitude;
  const nice = ratio <= 1 ? 1 : ratio <= 2 ? 2 : ratio <= 5 ? 5 : 10;
  return nice * magnitude;
}

const PriceRange = ({
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 200000,
  currency,
  formatValue,
  ticks = 25,
  showTicks = true,
  color,
  knob = "circle",
  disabled = false,
  className,
  ...props
}: PriceRangeProps) => {
  const reduceMotion = useReducedMotion();
  const areaRef = React.useRef<HTMLDivElement>(null);
  const thumbRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const [internal, setInternal] = React.useState<PriceRangeValue>(
    defaultValue ?? [min + (max - min) * 0.15, min + (max - min) * 0.6],
  );
  const [active, setActive] = React.useState<0 | 1>(1);
  const [dragging, setDragging] = React.useState(false);
  const draggingRef = React.useRef(false);
  const followRef = React.useRef(false);

  const span = Math.max(max - min, Number.EPSILON);
  const step = niceStep(span);
  const decimals = Math.max(0, -Math.floor(Math.log10(step)));
  const raw = value ?? internal;
  const low = clamp(Math.min(raw[0], raw[1]), min, max);
  const high = clamp(Math.max(raw[0], raw[1]), min, max);
  const lowPct = ((low - min) / span) * 100;
  const highPct = ((high - min) / span) * 100;

  const format = React.useMemo(() => {
    if (formatValue) return formatValue;
    const formatter = new Intl.NumberFormat("en", {
      notation: "compact",
      maximumFractionDigits: 1,
      ...(currency ? { style: "currency" as const, currency } : {}),
    });
    return (n: number) => formatter.format(n);
  }, [formatValue, currency]);

  const lowSpring = useSpring(lowPct, spring);
  const highSpring = useSpring(highPct, spring);

  React.useEffect(() => {
    if (followRef.current) return;
    if (reduceMotion) {
      lowSpring.jump(lowPct);
      highSpring.jump(highPct);
    } else {
      lowSpring.set(lowPct);
      highSpring.set(highPct);
    }
  }, [lowPct, highPct, reduceMotion, lowSpring, highSpring]);

  const lowLeft = useTransform(lowSpring, (v) => `${v}%`);
  const highLeft = useTransform(highSpring, (v) => `${v}%`);
  const fillWidth = useTransform(() => `${Math.max(0, highSpring.get() - lowSpring.get())}%`);
  const closeness = useTransform(() => clamp(1 - (highSpring.get() - lowSpring.get()) / 16, 0, 1));
  const lowLabelX = useTransform(closeness, (c) => `${-50 - 50 * c}%`);
  const highLabelX = useTransform(closeness, (c) => `${-50 + 50 * c}%`);

  const commit = (next: PriceRangeValue) => {
    if (next[0] === low && next[1] === high) return;
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };

  const toPct = (n: number) => ((n - min) / span) * 100;

  const moveThumb = (index: 0 | 1, target: number) => {
    const bounded = index === 0 ? clamp(target, min, high) : clamp(target, low, max);
    const snapped = Number((Math.round((bounded - min) / step) * step + min).toFixed(decimals));
    const next: PriceRangeValue =
      index === 0 ? [clamp(snapped, min, high), high] : [low, clamp(snapped, low, max)];
    if (followRef.current) (index === 0 ? lowSpring : highSpring).jump(toPct(bounded));
    commit(next);
  };

  const valueAt = (clientX: number) => {
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return low;
    return min + clamp((clientX - rect.left) / rect.width, 0, 1) * span;
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || event.button !== 0) return;
    event.preventDefault();
    const target = valueAt(event.clientX);
    const index: 0 | 1 =
      low === high
        ? target <= low
          ? 0
          : 1
        : Math.abs(target - low) <= Math.abs(target - high)
          ? 0
          : 1;
    event.currentTarget.setPointerCapture(event.pointerId);
    followRef.current = false;
    draggingRef.current = true;
    setActive(index);
    setDragging(true);
    thumbRefs.current[index]?.focus({ preventScroll: true });
    moveThumb(index, target);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    followRef.current = true;
    moveThumb(active, valueAt(event.clientX));
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    if (followRef.current) {
      followRef.current = false;
      const settle = reduceMotion ? "jump" : "set";
      lowSpring[settle](lowPct);
      highSpring[settle](highPct);
    }
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleKeyDown = (index: 0 | 1) => (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const current = index === 0 ? low : high;
    const big = Math.max(step, Math.round(span / 10 / step) * step);
    const moves: Record<string, number> = {
      ArrowRight: current + step,
      ArrowUp: current + step,
      ArrowLeft: current - step,
      ArrowDown: current - step,
      PageUp: current + big,
      PageDown: current - big,
      Home: min,
      End: max,
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    setActive(index);
    moveThumb(index, moves[event.key]);
  };

  const thumbs = [
    { value: low, left: lowLeft, labelX: lowLabelX },
    { value: high, left: highLeft, labelX: highLabelX },
  ] as const;

  const tickCount = Math.max(2, Math.round(ticks));

  return (
    <div
      role="group"
      aria-disabled={disabled || undefined}
      className={cn(priceRangeVariants({ color }), className)}
      {...props}
    >
      <div
        ref={areaRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={cn(
          "relative h-16 touch-none",
          disabled ? "pointer-events-none" : "cursor-pointer",
        )}
      >
        {thumbs.map((thumb, index) => (
          <motion.span
            key={`label-${index}`}
            aria-hidden
            className="text-foreground pointer-events-none absolute top-0 text-xs font-medium whitespace-nowrap tabular-nums"
            style={{ left: thumb.left, x: thumb.labelX }}
            animate={{ y: dragging && active === index ? -3 : 0 }}
            transition={reduceMotion ? { duration: 0 } : { type: "spring", ...spring }}
          >
            {format(thumb.value)}
          </motion.span>
        ))}

        <div className="bg-foreground/10 absolute inset-x-0 top-[29px] h-1.5 rounded-full">
          <motion.div
            className="absolute inset-y-0 rounded-full bg-current"
            style={{ left: lowLeft, width: fillWidth }}
          />
        </div>

        {thumbs.map((thumb, index) => (
          <motion.button
            key={`thumb-${index}`}
            ref={(node) => {
              thumbRefs.current[index] = node;
            }}
            type="button"
            role="slider"
            disabled={disabled}
            aria-label={index === 0 ? "Minimum price" : "Maximum price"}
            aria-valuemin={index === 0 ? min : low}
            aria-valuemax={index === 0 ? high : max}
            aria-valuenow={thumb.value}
            aria-valuetext={format(thumb.value)}
            onKeyDown={handleKeyDown(index as 0 | 1)}
            onFocus={() => setActive(index as 0 | 1)}
            className={cn(knobVariants({ knob }), active === index ? "z-20" : "z-10")}
            style={{ left: thumb.left }}
            animate={{ scale: dragging && active === index ? 1.2 : 1 }}
            transition={reduceMotion ? { duration: 0 } : { type: "spring", ...spring }}
          />
        ))}

        {showTicks && (
          <div aria-hidden className="absolute inset-x-0 bottom-1 flex items-start justify-between">
            {Array.from({ length: tickCount }, (_, i) => {
              const pct = (i / (tickCount - 1)) * 100;
              const inside = pct >= lowPct - 0.001 && pct <= highPct + 0.001;
              return (
                <span
                  key={i}
                  className={cn(
                    "w-px rounded-full transition-[height,background-color] duration-300 motion-reduce:transition-none",
                    inside ? "bg-muted-foreground h-2.5" : "bg-muted-foreground/35 h-2",
                  )}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

PriceRange.displayName = "PriceRange";

export { PriceRange, priceRangeVariants, knobVariants };
