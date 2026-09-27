"use client";

import { motion } from "motion/react";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
  type CSSProperties,
} from "react";

import { cn } from "@/lib/utils";

export interface PopTextProps {
  children: string;

  splitBy?: "words" | "characters";

  color?: string;
  outlineColor?: string;
  outlineWidth?: number;
  glow?: boolean;

  speed?: number;
  duration?: number;
  stagger?: number;
  delay?: number;
  bounce?: number;

  hoverPop?: boolean;

  className?: string;
  wordClassName?: string;
  charClassName?: string;

  autoStart?: boolean;
  inView?: boolean;
  once?: boolean;

  onStart?: () => void;
  onComplete?: () => void;
}

export interface PopTextRef {
  play: () => void;
  reset: () => void;
}

const PopText = forwardRef<PopTextRef, PopTextProps>(
  (
    {
      children,
      splitBy = "characters",
      color = "#b8ff8b",
      outlineColor,
      outlineWidth = 3,
      glow = true,
      speed = 1,
      duration = 0.5,
      stagger = 0.045,
      delay = 0,
      bounce = 0.55,
      hoverPop = true,
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

    const units = useMemo(() => {
      if (splitBy === "characters") return Array.from(children);
      return children.split(" ");
    }, [children, splitBy]);

    const effectiveDuration = duration / Math.max(speed, 0.01);
    const effectiveStagger = stagger / Math.max(speed, 0.01);

    const play = useCallback(() => {
      setPlayed(false);
      requestAnimationFrame(() => setPlayed(true));
      onStart?.();
    }, [onStart]);

    const reset = useCallback(() => setPlayed(false), []);

    useImperativeHandle(ref, () => ({ play, reset }), [play, reset]);

    const handleViewportEnter = useCallback(() => {
      if (once && played) return;
      play();
    }, [once, played, play]);

    const stroke = outlineColor ?? `color-mix(in srgb, ${color} 45%, black)`;

    const bubbleStyle: CSSProperties = {
      color,
      WebkitTextStroke: `${outlineWidth}px ${stroke}`,
      paintOrder: "stroke fill",
      filter: glow
        ? `drop-shadow(0 ${outlineWidth}px 0 ${stroke}) drop-shadow(0 0 16px color-mix(in srgb, ${color} 55%, transparent))`
        : `drop-shadow(0 ${outlineWidth}px 0 ${stroke})`,
    };

    return (
      <motion.span
        className={cn("font-pop inline-block leading-none", className)}
        viewport={{ once, margin: "-10% 0px -10% 0px" }}
        onViewportEnter={inView ? handleViewportEnter : undefined}
      >
        {units.map((unit, index) => (
          <motion.span
            key={`${unit}-${index}`}
            className={cn(
              "inline-block will-change-transform",
              splitBy === "words" ? wordClassName : charClassName,
              hoverPop &&
                "cursor-default transition-transform duration-150 ease-out hover:-translate-y-1.5 hover:scale-[1.15]"
            )}
            style={bubbleStyle}
            initial={{ scale: 0, rotate: -12, opacity: 0 }}
            animate={
              played
                ? { scale: 1, rotate: 0, opacity: 1 }
                : { scale: 0, rotate: -12, opacity: 0 }
            }
            transition={{
              type: bounce > 0 ? "spring" : "tween",
              bounce,
              duration: effectiveDuration,
              ease: bounce > 0 ? undefined : "easeOut",
              delay: delay + index * effectiveStagger,
            }}
            onAnimationComplete={() => {
              if (index === units.length - 1) onComplete?.();
            }}
          >
            {unit === " " ? "\u00A0" : unit}
            {splitBy === "words" && index < units.length - 1 ? "\u00A0" : ""}
          </motion.span>
        ))}
      </motion.span>
    );
  }
);

PopText.displayName = "PopText";

export { PopText };
