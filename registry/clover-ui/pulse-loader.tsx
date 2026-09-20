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

export interface PulseLoaderProps {
  color?: string;
  rings?: number;
  minOpacity?: number;
  maxOpacity?: number;
  size?: number;
  duration?: number;
  contraction?: number;
  stagger?: number;

  className?: string;
  ringClassName?: string;

  autoStart?: boolean;
}

export interface PulseLoaderRef {
  play: () => void;
  pause: () => void;
}

const PulseLoader = forwardRef<PulseLoaderRef, PulseLoaderProps>(
  (
    {
      color = "#0B87DA",
      rings = 4,
      minOpacity = 0.2,
      maxOpacity = 1,
      size = 60,
      duration = 1.8,
      contraction = 0.55,
      stagger = 0.15,
      className,
      ringClassName,
      autoStart = true,
    },
    ref
  ) => {
    const [running, setRunning] = useState(autoStart);

    const play = useCallback(() => setRunning(true), []);
    const pause = useCallback(() => setRunning(false), []);

    useImperativeHandle(ref, () => ({ play, pause }), [play, pause]);
    const ringData = useMemo(() => {
      return Array.from({ length: rings }, (_, i) => {
        const depth = i / (rings - 1 || 1);
        const scale = 1 - depth * 0.72;
        const opacity = minOpacity + depth * (maxOpacity - minOpacity);
        return {
          key: i,
          scale,
          opacity,
          delay: (rings - 1 - i) * stagger,
        };
      });
    }, [rings, minOpacity, maxOpacity, stagger]);

    return (
      <div
        className={cn("relative inline-flex items-center justify-center", className)}
        style={{ width: size, height: size }}
        role="status"
        aria-label="Loading"
      >
        {ringData.map((ring) => (
          <motion.span
            key={ring.key}
            className={cn("absolute rounded-full", ringClassName)}
            style={{
              width: `${ring.scale * 100}%`,
              height: `${ring.scale * 100}%`,
              backgroundColor: color,
              opacity: ring.opacity,
            }}
            animate={
              running
                ? { scale: [1, contraction, 1] }
                : { scale: 1 }
            }
            transition={{
              duration,
              delay: ring.delay,
              repeat: running ? Infinity : 0,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  }
);

PulseLoader.displayName = "PulseLoader";

export { PulseLoader };