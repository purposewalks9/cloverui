"use client";

import { motion } from "motion/react";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";

import { cn } from "@/lib/utils";

export interface SpinnerProps {
  /** Brightest / active dot color */
  color?: string;
  /** Dimmest / idle dot color/shade the dot fades back to */
  trackColor?: string;
  dots?: number;
  size?: number;
  dotSize?: number;
  /** Full time in seconds for the highlight to travel around the ring once */
  duration?: number;

  className?: string;
  dotClassName?: string;

  autoStart?: boolean;
}

export interface SpinnerRef {
  play: () => void;
  pause: () => void;
}

const Spinner = forwardRef<SpinnerRef, SpinnerProps>(
  (
    {
      color = "#0B87DA",
      trackColor = "rgba(11, 135, 218, 0.15)",
      dots = 12,
      size = 60,
      dotSize,
      duration = 1.2,
      className,
      dotClassName,
      autoStart = true,
    },
    ref
  ) => {
    const [running, setRunning] = useState(autoStart);

    const play = useCallback(() => setRunning(true), []);
    const pause = useCallback(() => setRunning(false), []);

    useImperativeHandle(ref, () => ({ play, pause }), [play, pause]);

    const resolvedDotSize = dotSize ?? size * 0.16;

    const dotData = useMemo(() => {
      return Array.from({ length: dots }, (_, i) => {
        const angle = (i / dots) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        const radius = (size - resolvedDotSize) / 2;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;
        // Stagger so each dot lags the previous one, tracing the ring.
        const delay = (i / dots) * duration;
        return { key: i, x, y, delay };
      });
    }, [dots, size, resolvedDotSize, duration]);

    return (
      <div
        className={cn("relative inline-flex items-center justify-center", className)}
        style={{ width: size, height: size }}
        role="status"
        aria-label="Loading"
      >
        {dotData.map((dot) => (
          <motion.span
            key={dot.key}
            className={cn("absolute rounded-full top-1/2 left-1/2", dotClassName)}
            style={{
              width: resolvedDotSize,
              height: resolvedDotSize,
              x: dot.x - resolvedDotSize / 2,
              y: dot.y - resolvedDotSize / 2,
            }}
            initial={{ backgroundColor: trackColor }}
            animate={
              running
                ? { backgroundColor: [trackColor, color, trackColor] }
                : { backgroundColor: trackColor }
            }
            transition={{
              duration,
              delay: dot.delay,
              repeat: running ? Infinity : 0,
              ease: "linear",
            }}
          />
        ))}
      </div>
    );
  }
);

Spinner.displayName = "Spinner";

export { Spinner };
