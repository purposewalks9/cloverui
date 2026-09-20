
"use client";

import { AnimationOptions, motion } from "motion/react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

export interface SlideTextProps {
  children: string;

  /** Split text into words or individual characters. */
  splitBy?: "words" | "characters";

  /** Direction the pieces enter/exit from. */
  direction?: "left" | "right";

  /** Whether pieces slide in or out. */
  mode?: "in" | "out";

  /** Distance each piece travels in pixels. */
  distance?: number;

  /** Color used while a piece is moving. */
  color?: string;

  /** Class applied after a piece lands. */
  landedClassName?: string;

  /** Initial delay before animation starts. */
  delay?: number;

  /** Delay between each word/character. */
  stagger?: number;

  /** Order pieces animate. */
  from?: "first" | "last" | "center";

  /** Motion transition. */
  transition?: AnimationOptions;

  className?: string;
  wordClassName?: string;
  charClassName?: string;

  autoStart?: boolean;
  inView?: boolean;
  once?: boolean;

  onStart?: () => void;
  onComplete?: () => void;
}

export interface SlideTextRef {
  play: () => void;
  reset: () => void;
}

function splitIntoCharacters(text: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("en", {
      granularity: "grapheme",
    });

    return Array.from(
      segmenter.segment(text),
      ({ segment }) => segment
    );
  }

  return Array.from(text);
}

interface SlidePieceProps {
  children: string;
  target: "hidden" | "visible";
  hiddenX: number;
  color: string;
  landedClassName: string;
  className?: string;
  transitionDelay: number;
  transition: AnimationOptions;
  onComplete?: () => void;
}

function SlidePiece({
  children,
  target,
  hiddenX,
  color,
  landedClassName,
  className,
  transitionDelay,
  transition,
  onComplete,
}: SlidePieceProps) {
  const [landed, setLanded] = useState(false);

  useEffect(() => {
    // Every piece starts in the sliding color.
    // It only becomes the normal color after its own animation finishes.
    setLanded(false);
  }, [target]);

  return (
    <span className="relative inline-block">
      <motion.span
        className={cn("inline-block", className)}
        initial={false}
        animate={
          target === "visible"
            ? {
                x: 0,
                opacity: 1,
              }
            : {
                x: hiddenX,
                opacity: 0,
              }
        }
        style={{
          color: landed ? undefined : color,
        }}
        transition={{
          ...transition,
          delay: transitionDelay,
        }}
        onAnimationComplete={() => {
          if (target === "visible") {
            setLanded(true);
            onComplete?.();
          }
        }}
      >
        <span className={landed ? landedClassName : undefined}>
          {children}
        </span>
      </motion.span>
    </span>
  );
}



const SlideText = forwardRef<SlideTextRef, SlideTextProps>(
  (
    {
      children,
      splitBy = "words",
      direction = "right",
      mode = "in",
      distance = 48,
      color = "hsl(var(--primary))",
      landedClassName = "text-foreground",
      delay = 0,
      stagger = 0.045,
      from = "first",
      transition = {
        type: "tween",
        ease: [0.625, 0.05, 0, 1],
        duration: 0.55,
      },
      className,
      wordClassName,
      charClassName,
      autoStart = true,
      inView = false,
      once = true,
      onStart,
      onComplete,
      ...props
    },
    ref
  ) => {
    const text = children ?? "";

    const [isAnimating, setIsAnimating] = useState(false);

    const completedCount = useRef(0);

    const pieces = useMemo(() => {
      if (splitBy === "characters") {
        return splitIntoCharacters(text);
      }

      return text.trim().split(/\s+/);
    }, [text, splitBy]);

    const restState: "hidden" | "visible" =
      mode === "in" ? "hidden" : "visible";

    const activeState: "hidden" | "visible" =
      mode === "in" ? "visible" : "hidden";

    const target = isAnimating ? activeState : restState;

    const hiddenX =
      direction === "right"
        ? distance
        : -distance;

    const getStaggerDelay = useCallback(
      (index: number) => {
        const total = pieces.length;

        switch (from) {
          case "last":
            return (total - 1 - index) * stagger;

          case "center": {
            const center = Math.floor(total / 2);
            return Math.abs(center - index) * stagger;
          }

          case "first":
          default:
            return index * stagger;
        }
      },
      [pieces.length, from, stagger]
    );

    const play = useCallback(() => {
      completedCount.current = 0;
      setIsAnimating(true);
      onStart?.();
    }, [onStart]);

    const reset = useCallback(() => {
      completedCount.current = 0;
      setIsAnimating(false);
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        play,
        reset,
      }),
      [play, reset]
    );

    useEffect(() => {
      if (autoStart && !inView) {
        play();
      }
    }, [autoStart, inView, play]);

    const handlePieceComplete = useCallback(() => {
      completedCount.current += 1;

      if (completedCount.current === pieces.length) {
        onComplete?.();
      }
    }, [pieces.length, onComplete]);

    return (
      <motion.span
        className={cn(
          "inline-flex cursor-pointer flex-wrap",
          className
        )}
        viewport={{
          once,
          margin: "-10% 0px -10% 0px",
        }}
        onViewportEnter={inView ? play : undefined}
        {...props}
      >
        {/* Accessibility */}
        <span className="sr-only">
          {text}
        </span>

        {/* Animated text */}
        <span
          aria-hidden="true"
          className="inline-flex flex-wrap"
        >
          {pieces.map((piece, index) => (
            <span
              key={`${piece}-${index}`}
              className="inline-flex"
            >
              <SlidePiece
                target={target}
                hiddenX={hiddenX}
                color={color}
                landedClassName={landedClassName}
                className={
                  splitBy === "characters"
                    ? charClassName
                    : wordClassName
                }
                transitionDelay={
                  delay + getStaggerDelay(index)
                }
                transition={transition}
                onComplete={handlePieceComplete}
              >
                {piece}
              </SlidePiece>

              {splitBy === "words" &&
                index !== pieces.length - 1 && (
                  <span aria-hidden="true">
                    {"\u00A0"}
                  </span>
                )}
            </span>
          ))}
        </span>
      </motion.span>
    );
  }
);

SlideText.displayName = "SlideText";

export { SlideText };
