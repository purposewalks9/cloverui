"use client";

import { motion, useReducedMotion } from "motion/react";
import * as React from "react";

import { cn } from "@/lib/utils";

export interface DropTextProps {
  ref?: React.Ref<DropTextRef>;
  children: string;

  splitBy?: "words" | "characters";

  dropDistance?: number;

  speed?: number;

  duration?: number;

  stagger?: number;

  delay?: number;

  bounce?: number;

  landedClassName?: string;

  className?: string;
  wordClassName?: string;
  charClassName?: string;

  autoStart?: boolean;
  inView?: boolean;
  once?: boolean;

  onStart?: () => void;
  onComplete?: () => void;
}

export interface DropTextRef {
  play: () => void;
  reset: () => void;
}

function DropText({
  ref,
  children,
  splitBy = "words",
  dropDistance = 40,
  speed = 1,
  duration = 0.5,
  stagger = 0.05,
  delay = 0,
  bounce = 0.35,
  landedClassName,
  className,
  wordClassName,
  charClassName,
  autoStart = true,
  inView = false,
  once = true,
  onStart,
  onComplete,
}: DropTextProps) {
  const reduceMotion = useReducedMotion();
  const [played, setPlayed] = React.useState(!inView && autoStart);
  const [landed, setLanded] = React.useState(false);
  const frame = React.useRef<number | null>(null);
  const cancelPlay = React.useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
  }, []);
  React.useEffect(() => cancelPlay, [cancelPlay]);

  const units = React.useMemo(() => {
    if (splitBy === "characters") {
      return Array.from(children);
    }
    return children.split(" ");
  }, [children, splitBy]);
  const offset = reduceMotion ? 0 : dropDistance;
  const hidden = { transform: `translateY(${-offset}px)`, opacity: 0 };
  const shown = { transform: "translateY(0px)", opacity: 1 };
  const effectiveDuration = duration / Math.max(speed, 0.01);
  const effectiveStagger = stagger / Math.max(speed, 0.01);

  const play = React.useCallback(() => {
    cancelPlay();
    setLanded(false);
    setPlayed(false);
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      setPlayed(true);
    });
    onStart?.();
  }, [onStart, cancelPlay]);

  const reset = React.useCallback(() => {
    cancelPlay();
    setPlayed(false);
    setLanded(false);
  }, [cancelPlay]);

  React.useImperativeHandle(ref, () => ({ play, reset }), [play, reset]);

  const handleViewportEnter = React.useCallback(() => {
    if (once && played) return;
    play();
  }, [once, played, play]);

  return (
    <motion.span
      className={cn("inline-block", className)}
      viewport={{ once, margin: "-10% 0px -10% 0px" }}
      onViewportEnter={inView ? handleViewportEnter : undefined}
    >
      {units.map((unit, index) => (
        <motion.span
          key={`${unit}-${index}`}
          className={cn(
            "inline-block",
            splitBy === "words" ? wordClassName : charClassName,
            landed && landedClassName,
          )}
          style={{ willChange: landed ? undefined : "transform, opacity" }}
          initial={hidden}
          animate={played ? shown : hidden}
          transition={{
            type: bounce > 0 && !reduceMotion ? "spring" : "tween",
            bounce,
            duration: reduceMotion ? 0.2 : effectiveDuration,
            ease: bounce > 0 && !reduceMotion ? undefined : "easeIn",
            delay: reduceMotion ? 0 : delay + index * effectiveStagger,
          }}
          onAnimationComplete={() => {
            if (played && index === units.length - 1) {
              setLanded(true);
              onComplete?.();
            }
          }}
        >
          {unit}
          {splitBy === "words" && index < units.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </motion.span>
  );
}

export { DropText };
