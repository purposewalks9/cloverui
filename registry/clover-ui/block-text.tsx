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

export const BLOCK_TEXT_THEMES = {
  halloween: { colors: ["#ea580c", "#6d28d9", "#1c1917"], textColor: "#fff7ed" },
  classic: { colors: ["#16a34a", "#ff5a1f", "#0029ff"], textColor: "#f5f5f5" },
  ocean: { colors: ["#0369a1", "#0d9488", "#1e3a8a"], textColor: "#f0f9ff" },
  candy: { colors: ["#db2777", "#9333ea", "#e11d48"], textColor: "#fdf2f8" },
  sunset: { colors: ["#dc2626", "#ea580c", "#b45309"], textColor: "#fff7ed" },
} as const;

export type BlockTextTheme = keyof typeof BLOCK_TEXT_THEMES;

export interface BlockTextProps extends Omit<React.ComponentProps<"span">, "children" | "color"> {
  words?: string[];
  theme?: BlockTextTheme;
  colors?: string[];
  textColor?: string;
  interval?: number;
  duration?: number;
  paused?: boolean;
  shimmer?: boolean;
}

const DEFAULT_WORDS = ["Trick", "Treat", "Boo!"];
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
  shimmer,
}: {
  face: number;
  angle: MotionValue<number>;
  word: string;
  color: string;
  shimmer: boolean;
}) {
  const shade = useTransform(angle, (value) => {
    const turn = ((value - face * 90) * Math.PI) / 180;
    return Math.min(0.55, Math.max(0, (1 - Math.cos(turn)) * 0.55));
  });

  return (
    <span
      className="absolute inset-0 flex items-center overflow-hidden px-[0.55em] backface-hidden"
      style={{
        backgroundImage: `radial-gradient(120% 140% at 50% 0%, color-mix(in oklab, ${color} 62%, white) 0%, ${color} 42%, color-mix(in oklab, ${color} 66%, black) 100%)`,
        transform: `rotateX(${face * -90}deg) translateZ(calc(var(--block-h) / 2))`,
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-px bg-[linear-gradient(180deg,rgba(255,255,255,.28),transparent_42%)] opacity-80"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-x-1/3 top-0 h-px bg-white/70 blur-sm"
      />
      {shimmer ? (
        <motion.span
          className="relative whitespace-nowrap [filter:drop-shadow(0_1px_0_rgb(0_0_0/0.18))]"
          style={{
            WebkitTextFillColor: "transparent",
            backgroundColor: "currentColor",
            backgroundImage: `linear-gradient(to right, currentColor 0%, color-mix(in oklab, ${color} 60%, white) 40%, color-mix(in oklab, ${color} 60%, white) 60%, currentColor 100%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            backgroundRepeat: "no-repeat",
            backgroundSize: "50% 200%",
          }}
          initial={{ backgroundPositionX: "250%" }}
          animate={{ backgroundPositionX: ["-100%", "250%"] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1.5, ease: "linear" }}
        >
          {word}
        </motion.span>
      ) : (
        <span className="relative whitespace-nowrap [text-shadow:0_1px_0_rgb(0_0_0/0.18)]">
          {word}
        </span>
      )}
      <motion.span className="absolute inset-0 bg-black" style={{ opacity: shade }} />
    </span>
  );
}

function BlockText({
  words = DEFAULT_WORDS,
  theme = "halloween",
  colors,
  textColor,
  interval = 1.4,
  duration = 1.2,
  paused = false,
  shimmer = true,
  className,
  style,
  ...props
}: BlockTextProps) {
  const reduceMotion = useReducedMotion();
  const angle = useMotionValue(0);
  const [step, setStep] = React.useState(0);
  const stepRef = React.useRef(0);
  const list = words.length > 0 ? words : [""];
  const preset = BLOCK_TEXT_THEMES[theme] ?? BLOCK_TEXT_THEMES.halloween;
  const palette: readonly string[] = colors && colors.length > 0 ? colors : preset.colors;
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
      style={{ color: textColor ?? preset.textColor, ...style }}
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
              shimmer={shimmer && !reduceMotion}
            />
          );
        })}
      </motion.span>
    </span>
  );
}

export { BlockText };
