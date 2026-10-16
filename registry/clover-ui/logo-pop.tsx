"use client";

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";

import { cn } from "@/lib/utils";

export interface LogoPopLogo {
  name: string;
  src: string;
  ratio?: number;
}

export interface LogoPopProps extends React.ComponentProps<"ul"> {
  logos?: LogoPopLogo[];
  speed?: number;
  label?: string;
}

const BASE = "https://cloverui.vercel.app/logos/";

export const logoPopLogos: LogoPopLogo[] = (
  [
    ["vercel", "Vercel", 5.03],
    ["openai", "OpenAI", 3.69],
    ["linear", "Linear", 4],
    ["notion", "Notion", 2.88],
    ["cursor", "Cursor", 5.31],
    ["framer", "Framer", 4.43],
    ["discord", "Discord", 3.65],
    ["google", "Google", 2.96],
    ["shopify", "Shopify", 3.5],
    ["netflix", "Netflix", 3.7],
    ["ramp", "Ramp", 3.76],
    ["descript", "Descript", 4.25],
    ["duolingo", "Duolingo", 4.27],
    ["phantom", "Phantom", 5.07],
    ["opensea", "OpenSea", 4.2],
    ["tesla", "Tesla", 9.77],
  ] as const
).map(([file, name, ratio]) => ({ name, src: `${BASE}${file}.svg`, ratio }));

const STILL: Variants = {
  hidden: { opacity: 1, scale: 1, rotate: 0 },
  shown: { opacity: 1, scale: 1, rotate: 0 },
};

function random(seed: number) {
  let value = seed;
  return () => {
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function plan(count: number) {
  const next = random(count * 31 + 7);
  const order = Array.from({ length: count }, (_, index) => index);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const slots = new Array<number>(count);
  order.forEach((logo, slot) => {
    slots[logo] = slot;
  });
  return slots.map((slot) => ({ slot, tilt: (next() - 0.5) * 36 }));
}

function subscribeNothing() {
  return () => {};
}

function LogoPop({
  logos = logoPopLogos,
  speed = 1,
  label = "Logos of companies",
  className,
  ref,
  ...props
}: LogoPopProps) {
  const reduceMotion = useReducedMotion();
  const mounted = React.useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
  const still = mounted && Boolean(reduceMotion);
  const pace = 1 / Math.max(speed, 0.1);
  const steps = React.useMemo(() => plan(logos.length), [logos.length]);
  const listRef = React.useRef<HTMLUListElement>(null);
  React.useImperativeHandle(ref, () => listRef.current!, []);
  const marks = React.useRef<(HTMLSpanElement | null)[]>([]);
  const [started, setStarted] = React.useState(false);
  const stagger = (1.2 / Math.max(logos.length, 1)) * pace;

  React.useEffect(() => {
    const list = listRef.current;
    if (!list || started) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStarted(true);
      },
      { threshold: 0.3 },
    );
    observer.observe(list);
    return () => observer.disconnect();
  }, [started]);

  React.useEffect(() => {
    if (!started || still || logos.length === 0) return;
    const pick = random(logos.length * 13 + 5);
    const animations = new Set<Animation>();
    let bounce = 0;
    const wait = window.setTimeout(
      () => {
        bounce = window.setInterval(() => {
          const animation = marks.current[Math.floor(pick() * logos.length)]?.animate(
            [
              { transform: "scale(1) rotate(0deg)" },
              { transform: "scale(1.14) rotate(-4deg)" },
              { transform: "scale(1) rotate(0deg)" },
            ],
            { duration: 420 * pace, easing: "ease-out" },
          );
          if (animation) {
            animations.add(animation);
            animation.onfinish = () => animations.delete(animation);
          }
        }, 1300 * pace);
      },
      (0.6 * pace + logos.length * stagger) * 1000,
    );
    return () => {
      window.clearTimeout(wait);
      window.clearInterval(bounce);
      animations.forEach((animation) => animation.cancel());
    };
  }, [started, still, logos.length, pace, stagger]);

  const piece: Variants = still
    ? STILL
    : {
        hidden: (step: { tilt: number }) => ({ opacity: 0, scale: 0, rotate: step.tilt }),
        shown: (step: { slot: number; tilt: number }) => ({
          opacity: 1,
          scale: [0, 1.3, 0.94, 1],
          rotate: [step.tilt, step.tilt * -0.3, 0],
          transition: {
            delay: 0.1 * pace + step.slot * stagger,
            duration: 0.38 * pace,
            ease: "easeOut",
            opacity: { delay: 0.1 * pace + step.slot * stagger, duration: 0.06 * pace },
          },
        }),
      };

  return (
    <ul
      ref={listRef}
      aria-label={label}
      className={cn(
        "text-foreground/80 grid w-full grid-cols-2 place-items-center gap-x-8 gap-y-10 text-base sm:grid-cols-4",
        className,
      )}
      {...props}
    >
      {logos.map((logo, index) => {
        const ratio = logo.ratio && logo.ratio > 0 ? logo.ratio : 3.5;
        const mask = `url("${logo.src}")`;
        return (
          <motion.li
            key={`${logo.name}-${index}`}
            custom={steps[index]}
            variants={piece}
            initial="hidden"
            animate={started || still ? "shown" : "hidden"}
            className="flex h-[2.6em] w-full items-center justify-center"
          >
            <span
              ref={(node) => {
                marks.current[index] = node;
              }}
              role="img"
              aria-label={logo.name}
              className="block max-h-full bg-current"
              style={{
                width: `${Math.min(6.5, 2.2 * Math.sqrt(ratio))}em`,
                aspectRatio: ratio,
                maskImage: mask,
                WebkitMaskImage: mask,
                maskSize: "contain",
                WebkitMaskSize: "contain",
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
                maskPosition: "center",
                WebkitMaskPosition: "center",
              }}
            />
          </motion.li>
        );
      })}
    </ul>
  );
}

export { LogoPop };
