"use client";

import * as React from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";

import { cn } from "@/lib/utils";

export interface BlockTextProps extends Omit<React.ComponentProps<"span">, "children" | "color"> {
  words?: string[];
  colors?: string[];
  textColor?: string;
  interval?: number;
  duration?: number;
  paused?: boolean;
}

const DEFAULT_WORDS = ["Welcome", "Hello", "Thanks"];
const DEFAULT_COLORS = ["#16a34a", "#ff5a1f", "#0029ff"];
const FACES = [0, 1, 2, 3];

function faceStep(face: number, step: number) {
  const ahead = step + 1;
  return ahead - ((((ahead - face) % 4) + 4) % 4);
}

function Face({
  face,
  angle,
  word,
  color,
}: {
  face: number;
  angle: MotionValue<number>;
  word: string;
  color: string;
}) {
  const shade = useTransform(angle, (value) => {
    const turn = ((value - face * 90) * Math.PI) / 180;
    return Math.min(0.55, Math.max(0, (1 - Math.cos(turn)) * 0.55));
  });

  return (
    <span
      className="absolute inset-0 flex items-center overflow-hidden px-[0.55em] backface-hidden"
      style={{
        backgroundColor: color,
        transform: `rotateX(${face * -90}deg) translateZ(calc(var(--block-h) / 2))`,
      }}
    >
      <span className="relative whitespace-nowrap">{word}</span>
      <motion.span className="absolute inset-0 bg-black" style={{ opacity: shade }} />
    </span>
  );
}

function BlockText({
  words = DEFAULT_WORDS,
  colors = DEFAULT_COLORS,
  textColor = "#f5f5f5",
  interval = 1.4,
  duration = 0.65,
  paused = false,
  className,
  style,
  ...props
}: BlockTextProps) {
  const reduceMotion = useReducedMotion();
  const angle = useMotionValue(0);
  const [step, setStep] = React.useState(0);
  const stepRef = React.useRef(0);
  const list = words.length > 0 ? words : [""];
  const palette = colors.length > 0 ? colors : DEFAULT_COLORS;
  const count = list.length;

  const transform = useTransform(
    angle,
    (value) => `translateZ(calc(var(--block-h) / -2)) rotateX(${value}deg)`,
  );

  React.useEffect(() => {
    if (paused || count < 2) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let controls: ReturnType<typeof animate> | undefined;
    let cancelled = false;

    const roll = () => {
      timer = setTimeout(() => {
        const next = stepRef.current + 1;
        controls = animate(angle, next * 90, {
          duration: reduceMotion ? 0 : duration,
          ease: [0.65, 0, 0.25, 1],
        });
        controls.then(() => {
          if (cancelled) return;
          stepRef.current = next;
          setStep(next);
          roll();
        });
      }, interval * 1000);
    };

    roll();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      controls?.stop();
      angle.set(stepRef.current * 90);
    };
  }, [angle, count, duration, interval, paused, reduceMotion]);

  return (
    <span
      className={cn(
        "relative inline-block align-middle text-4xl leading-none font-bold tracking-tight [--block-h:1.9em] perspective-[14em]",
        className,
      )}
      style={{ color: textColor, ...style }}
      {...props}
    >
      <span className="sr-only">{list.join(", ")}</span>

      <span aria-hidden className="invisible grid">
        {list.map((word, index) => (
          <span
            key={`${word}-${index}`}
            className="col-start-1 row-start-1 flex h-(--block-h) items-center px-[0.55em] whitespace-nowrap"
          >
            {word}
          </span>
        ))}
      </span>

      <motion.span
        aria-hidden
        className="absolute inset-0 will-change-transform transform-3d"
        style={{ transform }}
      >
        {FACES.map((face) => {
          const at = faceStep(face, step);
          const index = ((at % count) + count) % count;
          return (
            <Face
              key={face}
              face={face}
              angle={angle}
              word={list[index]}
              color={palette[index % palette.length]}
            />
          );
        })}
      </motion.span>
    </span>
  );
}

export { BlockText };
