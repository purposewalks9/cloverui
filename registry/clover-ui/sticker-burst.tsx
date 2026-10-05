"use client";

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";

import { cn } from "@/lib/utils";

export type StickerBurstTrigger = "loop" | "hover";

export interface StickerBurstProps extends Omit<React.ComponentProps<"div">, "title" | "color"> {
  title?: string;
  stickers?: string[];
  colors?: string[];
  textColor?: string;
  count?: number;
  speed?: number;
  trigger?: StickerBurstTrigger;
}

type Phase = "rest" | "burst";

type Sticker = {
  text: string;
  left: number;
  top: number;
  size: number;
  from: string;
  to: string;
  z: number;
};

const DEFAULT_STICKERS = [
  "Ideas in motion",
  "Made with care",
  "Open source",
  "Copy & paste",
  "Motion matters",
  "Design systems",
  "Ship it",
  "Hello world",
  "New drop",
  "Dark mode ready",
  "Built for React",
  "Free forever",
  "v2.0",
  "Components",
  "Small details, big feel",
  "Accessible by default",
];

const DEFAULT_COLORS = ["#f2f20a", "#c2f23c", "#5cf08e", "#20eee4"];
const SIZES = [0.6, 0.6, 0.7, 0.7, 0.85, 1, 1.25, 1.6];

function random(seed: number) {
  let value = seed;
  return () => {
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function layout(texts: string[], colors: string[], count: number): Sticker[] {
  const next = random(count * 31 + texts.length * 7 + colors.length);
  const palette = colors.length > 0 ? colors : DEFAULT_COLORS;
  const words = texts.length > 0 ? texts : DEFAULT_STICKERS;

  return Array.from({ length: count }, (_, index) => {
    const angle = next() * Math.PI * 2;
    const reach = Math.sqrt(next());
    const shade = Math.floor(next() * palette.length);
    return {
      text: words[index % words.length],
      left: 50 + Math.cos(angle) * reach * 48,
      top: 50 + Math.sin(angle) * reach * 46,
      size: SIZES[Math.floor(next() * SIZES.length)],
      from: palette[shade],
      to: palette[Math.min(palette.length - 1, shade + 1)],
      z: index,
    };
  });
}

function StickerBurst({
  title = "Ideas in motion",
  stickers = DEFAULT_STICKERS,
  colors = DEFAULT_COLORS,
  textColor = "#1d4b38",
  count = 42,
  speed = 1,
  trigger = "loop",
  className,
  onPointerEnter,
  onPointerLeave,
  ...props
}: StickerBurstProps) {
  const reduceMotion = useReducedMotion();
  const pace = 1 / Math.max(speed, 0.1);
  const total = Math.max(0, Math.round(count));
  const textKey = stickers.join("\u0001");
  const colorKey = colors.join("\u0001");
  const pieces = React.useMemo(
    () =>
      layout(
        textKey ? textKey.split("\u0001") : [],
        colorKey ? colorKey.split("\u0001") : [],
        total,
      ),
    [textKey, colorKey, total],
  );
  const [phase, setPhase] = React.useState<Phase>(reduceMotion ? "burst" : "rest");
  const [order, setOrder] = React.useState<number[]>([]);
  const stagger = (1.3 / Math.max(total, 1)) * pace;
  const fillTime = 0.25 * pace + total * stagger + 0.3 * pace;
  const still = Boolean(reduceMotion);

  React.useEffect(() => {
    if (still) {
      setPhase("burst");
      return;
    }
    if (trigger !== "loop") {
      setPhase("rest");
      return;
    }

    let timer: ReturnType<typeof setTimeout>;
    const rest = () => {
      setPhase("rest");
      timer = setTimeout(burst, 1.1 * pace * 1000);
    };
    const burst = () => {
      setPhase("burst");
      timer = setTimeout(rest, (fillTime + 1.2 * pace) * 1000);
    };
    timer = setTimeout(burst, 0.8 * pace * 1000);

    return () => clearTimeout(timer);
  }, [trigger, still, pace, fillTime]);

  React.useEffect(() => {
    if (phase !== "burst" || still || total < 2) {
      setOrder([]);
      return;
    }
    const pick = random(total * 13);
    let top = total;
    let shuffle: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      shuffle = setInterval(() => {
        const index = Math.floor(pick() * total);
        top += 1;
        setOrder((current) => {
          const next = current.length === total ? [...current] : pieces.map((piece) => piece.z);
          next[index] = top;
          return next;
        });
      }, 110 * pace);
    }, fillTime * 1000);

    return () => {
      clearTimeout(start);
      if (shuffle) clearInterval(shuffle);
    };
  }, [phase, still, total, pace, fillTime, pieces]);

  const group: Variants = {
    rest: {
      scale: 0.42,
      transition: {
        duration: 0.7 * pace,
        ease: [0.65, 0, 0.35, 1],
        staggerChildren: 0.008 * pace,
        staggerDirection: -1,
      },
    },
    burst: {
      scale: 1,
      transition: {
        duration: 0.8 * pace,
        ease: [0.2, 0.8, 0.2, 1],
        delayChildren: 0.25 * pace,
        staggerChildren: stagger,
      },
    },
  };

  const piece: Variants = {
    rest: { opacity: 0, scale: 0.5, transition: { duration: 0.2 * pace } },
    burst: {
      opacity: 1,
      scale: [0.5, 1.08, 1],
      transition: { duration: 0.28 * pace, ease: "easeOut" },
    },
  };

  return (
    <div
      className={cn(
        "relative h-80 w-full overflow-hidden font-mono text-sm leading-tight select-none",
        className,
      )}
      style={{ color: textColor }}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (trigger === "hover" && !still) setPhase("burst");
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        if (trigger === "hover" && !still) setPhase("rest");
      }}
      {...props}
    >
      <motion.div
        className="absolute inset-0"
        variants={group}
        initial={still ? "burst" : "rest"}
        animate={phase}
      >
        {pieces.map((sticker, index) => (
          <motion.span
            key={index}
            aria-hidden
            variants={still ? undefined : piece}
            className="absolute max-w-[11em] -translate-x-1/2 -translate-y-1/2 border px-[0.35em] py-[0.15em] font-semibold"
            style={{
              left: `${sticker.left}%`,
              top: `${sticker.top}%`,
              fontSize: `${sticker.size}em`,
              zIndex: order[index] ?? sticker.z,
              borderColor: `color-mix(in oklab, ${textColor} 45%, transparent)`,
              backgroundImage: `linear-gradient(90deg, ${sticker.from}, ${sticker.to})`,
            }}
          >
            {sticker.text}
          </motion.span>
        ))}

        <span
          className="absolute top-1/2 left-1/2 max-w-[9em] -translate-x-1/2 -translate-y-1/2 border px-[0.3em] py-[0.15em] text-[2.1em] leading-[1.05] font-bold whitespace-pre-line uppercase"
          style={{
            zIndex: 100000,
            borderColor: `color-mix(in oklab, ${textColor} 45%, transparent)`,
            backgroundColor: (colors.length > 0 ? colors : DEFAULT_COLORS)[0],
          }}
        >
          {title}
        </span>
      </motion.div>
    </div>
  );
}

export { StickerBurst };
