"use client";

import * as React from "react";
import { Gauge } from "lucide-react";

import { cn } from "@/lib/utils";

export type GaugeSpeed = "slow" | "normal" | "fast";

export interface GaugeTextProps extends Omit<
  React.ComponentPropsWithoutRef<"span">,
  "children" | "color"
> {
  ref?: React.Ref<GaugeTextRef>;
  value: number;

  suffix?: string;

  label: string;

  speed?: GaugeSpeed;

  color?: string;

  landedClassName?: string;

  decimals?: number;

  duration?: number;

  showIcon?: boolean;

  className?: string;
  numberClassName?: string;
  labelClassName?: string;
  iconClassName?: string;

  autoStart?: boolean;
  inView?: boolean;
  once?: boolean;

  onStart?: () => void;
  onComplete?: () => void;
}

export interface GaugeTextRef {
  play: () => void;
  reset: () => void;
}

const COUNT_DURATION: Record<GaugeSpeed, number> = {
  slow: 2.2,
  normal: 1.3,
  fast: 0.75,
};

function easeOutExpo(t: number) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function GaugeText({
  ref,
  value,
  suffix = "x",
  label,
  speed = "normal",
  color = "var(--primary)",
  landedClassName = "text-foreground",
  decimals = 0,
  duration,
  showIcon = true,
  className,
  numberClassName,
  labelClassName,
  iconClassName,
  autoStart = true,
  inView = false,
  once = true,
  onStart,
  onComplete,
  ...props
}: GaugeTextProps) {
  const [display, setDisplay] = React.useState(0);
  const [landed, setLanded] = React.useState(false);

  const frame = React.useRef<number | null>(null);
  const hasPlayedRef = React.useRef(false);
  const callbacks = React.useRef({ onStart, onComplete });
  React.useEffect(() => {
    callbacks.current = { onStart, onComplete };
  }, [onStart, onComplete]);

  const countDuration = duration ?? COUNT_DURATION[speed];

  const play = React.useCallback(() => {
    if (frame.current) {
      cancelAnimationFrame(frame.current);
    }

    setLanded(false);
    callbacks.current.onStart?.();

    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      const t = countDuration > 0 ? Math.min(elapsed / countDuration, 1) : 1;
      const eased = easeOutExpo(t);

      setDisplay(value * eased);

      if (t < 1) {
        frame.current = requestAnimationFrame(tick);
      } else {
        setDisplay(value);
        setLanded(true);
        frame.current = null;
        callbacks.current.onComplete?.();
      }
    };

    frame.current = requestAnimationFrame(tick);
  }, [value, countDuration]);

  const reset = React.useCallback(() => {
    if (frame.current) {
      cancelAnimationFrame(frame.current);
    }

    setDisplay(0);
    setLanded(false);
    hasPlayedRef.current = false;
  }, []);

  React.useImperativeHandle(ref, () => ({ play, reset }), [play, reset]);

  React.useEffect(() => {
    let start = 0;
    if (autoStart && !inView) {
      hasPlayedRef.current = true;
      start = requestAnimationFrame(play);
    }

    return () => {
      cancelAnimationFrame(start);
      if (frame.current) {
        cancelAnimationFrame(frame.current);
      }
    };
  }, [autoStart, inView, play]);

  const handleViewportEnter = React.useCallback(() => {
    if (once && hasPlayedRef.current) return;

    hasPlayedRef.current = true;
    play();
  }, [once, play]);

  const precision = Number.isFinite(decimals)
    ? Math.max(0, Math.min(100, Math.trunc(decimals)))
    : 0;
  const formatted = React.useMemo(() => display.toFixed(precision), [display, precision]);

  return (
    <span
      className={cn("inline-flex cursor-pointer items-center gap-2 font-medium", className)}
      {...props}
    >
      <GaugeTrigger inView={inView} once={once} onEnter={handleViewportEnter} />

      <span
        className={cn("tabular-nums", numberClassName)}
        style={{
          color: landed ? undefined : color,
        }}
      >
        {formatted}
        {suffix}
      </span>

      {showIcon && (
        <Gauge
          className={cn("size-[0.72em] shrink-0", iconClassName)}
          style={{
            color: landed ? undefined : color,
          }}
          aria-hidden="true"
        />
      )}

      <span
        className={cn(landed ? landedClassName : undefined, labelClassName)}
        style={{
          color: landed ? undefined : color,
        }}
      >
        {label}
      </span>
    </span>
  );
}

function GaugeTrigger({
  inView,
  once,
  onEnter,
}: {
  inView: boolean;
  once: boolean;
  onEnter: () => void;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const firedRef = React.useRef(false);

  React.useEffect(() => {
    if (!inView || !ref.current) return;

    const node = ref.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (once && firedRef.current) return;

        firedRef.current = true;
        onEnter();
      },
      {
        rootMargin: "-10% 0px -10% 0px",
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [inView, once, onEnter]);

  if (!inView) return null;

  return <span ref={ref} className="sr-only" aria-hidden="true" />;
}

export { GaugeText };
