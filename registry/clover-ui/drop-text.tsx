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

export interface DropTextProps {
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

const DropText = forwardRef<DropTextRef, DropTextProps>(
  (
    {
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
    },
    ref
  ) => {
    const [played, setPlayed] = useState(!inView && autoStart);
    const [landed, setLanded] = useState(false);

    const units = useMemo(() => {
      if (splitBy === "characters") {
        return Array.from(children);
      }
      return children.split(" ");
    }, [children, splitBy]);
    const effectiveDuration = duration / Math.max(speed, 0.01);
    const effectiveStagger = stagger / Math.max(speed, 0.01);

    const play = useCallback(() => {
      setLanded(false);
      setPlayed(false);
      requestAnimationFrame(() => setPlayed(true));
      onStart?.();
    }, [onStart]);

    const reset = useCallback(() => {
      setPlayed(false);
      setLanded(false);
    }, []);

    useImperativeHandle(ref, () => ({ play, reset }), [play, reset]);

    const handleViewportEnter = useCallback(() => {
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
              landed && landedClassName
            )}
            initial={{ y: -dropDistance, opacity: 0 }}
            animate={
              played
                ? { y: 0, opacity: 1 }
                : { y: -dropDistance, opacity: 0 }
            }
            transition={{
              type: bounce > 0 ? "spring" : "tween",
              bounce,
              duration: effectiveDuration,
              ease: bounce > 0 ? undefined : "easeIn",
              delay: delay + index * effectiveStagger,
            }}
            onAnimationComplete={() => {
              if (index === units.length - 1) {
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
);

DropText.displayName = "DropText";

export { DropText };