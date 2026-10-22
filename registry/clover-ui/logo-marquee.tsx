"use client";

import * as React from "react";
import { useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

export interface LogoMarqueeLogo {
  name: string;
  src: string;
  ratio?: number;
}

export interface LogoMarqueeProps extends React.ComponentProps<"ul"> {
  logos?: LogoMarqueeLogo[];
  speed?: number;
  label?: string;
  shimmer?: boolean;
  shimmerColor?: string;
}

const BASE = "https://cloverui.xyz/logos/";

export const logoMarqueeLogos: LogoMarqueeLogo[] = (
  [
    ["vercel", "Vercel", 5.03],
    ["convex", "Convex", 5.74],
    ["openai", "OpenAI", 3.69],
    ["anthropic", "Anthropic", 8.83],
    ["linear", "Linear", 4],
    ["notion", "Notion", 2.88],
    ["cursor", "Cursor", 5.68],
    ["framer", "Framer", 4.43],
    ["discord", "Discord", 3.65],
    ["shopify", "Shopify", 3.5],
    ["descript", "Descript", 4.25],
    ["stripe", "Stripe", 2.39],
    ["raycast", "Raycast", 3.86],
    ["clerk", "Clerk", 3.44],
  ] as const
).map(([file, name, ratio]) => ({ name, src: `${BASE}${file}.svg`, ratio }));

const SPOTS = [
  { scale: 1, lift: 0, blur: 0, fade: 1 },
  { scale: 0.74, lift: 0.55, blur: 1, fade: 0.55 },
  { scale: 0.56, lift: 1.3, blur: 2, fade: 0 },
];

function wrap(offset: number, count: number) {
  const half = Math.floor(count / 2);
  return ((((offset + half) % count) + count) % count) - half;
}

function subscribePage(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

function LogoMarquee({
  logos = logoMarqueeLogos,
  speed = 1,
  label = "Logos of companies",
  shimmer = true,
  shimmerColor,
  className,
  style,
  ref,
  ...props
}: LogoMarqueeProps) {
  const reduceMotion = useReducedMotion();
  const pace = 1 / Math.max(speed, 0.1);
  const listRef = React.useRef<HTMLUListElement>(null);
  React.useImperativeHandle(ref, () => listRef.current!, []);
  const [{ active, previous }, setStep] = React.useState({ active: 0, previous: 0 });
  const [inView, setInView] = React.useState(false);
  const pageShown = React.useSyncExternalStore(
    subscribePage,
    () => document.visibilityState === "visible",
    () => true,
  );
  const visible = inView && pageShown;
  const marks = React.useRef<(HTMLSpanElement | null)[]>([]);

  React.useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.3,
    });
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!visible || reduceMotion || logos.length < 2) return;
    const timer = window.setInterval(
      () => setStep((step) => ({ active: step.active - 1, previous: step.active })),
      1750 * pace,
    );
    return () => window.clearInterval(timer);
  }, [visible, reduceMotion, logos.length, pace]);

  React.useEffect(() => {
    if (!shimmer || !visible || reduceMotion || logos.length === 0) return;
    const index = ((active % logos.length) + logos.length) % logos.length;
    const animation = marks.current[index]?.animate(
      [{ backgroundPosition: "150% 0" }, { backgroundPosition: "-50% 0" }],
      {
        duration: (logos.length > 1 ? 750 : 1400) * pace,
        delay: (logos.length > 1 ? 950 : 250) * pace,
        iterations: logos.length > 1 ? 1 : Infinity,
        easing: "ease-in-out",
      },
    );
    return () => animation?.cancel();
  }, [shimmer, visible, reduceMotion, pace, logos.length, active]);

  const shine = shimmerColor
    ? `color-mix(in oklab, ${shimmerColor} 35%, white)`
    : "color-mix(in oklab, currentColor 45%, var(--background, white))";

  return (
    <ul
      ref={listRef}
      aria-label={label}
      className={cn(
        "text-foreground/80 relative h-[4.5em] w-full overflow-hidden text-2xl",
        className,
      )}
      style={style}
      {...props}
    >
      {logos.map((logo, index) => {
        const ratio = logo.ratio && logo.ratio > 0 ? logo.ratio : 3.5;
        const mask = `url("${logo.src}")`;
        const offset = wrap(index - active, logos.length);
        const spot = SPOTS[Math.min(Math.abs(offset), SPOTS.length - 1)];
        const jump = Math.abs(offset - wrap(index - previous, logos.length)) > 1;
        return (
          <li
            key={`${logo.name}-${index}`}
            aria-hidden={offset !== 0 || undefined}
            className="absolute top-1/2 left-1/2 flex h-[2.6em] w-[7em] items-center justify-center"
            style={{
              transform: `translate3d(calc(-50% + ${offset * 7.5}em), calc(-50% + ${spot.lift}em), 0) scale(${spot.scale})`,
              willChange: "transform, filter, opacity",
              backfaceVisibility: "hidden",
              filter: spot.blur ? `blur(${spot.blur}px)` : undefined,
              opacity: spot.fade,
              zIndex: SPOTS.length - Math.abs(offset),
              transition:
                reduceMotion || jump
                  ? "none"
                  : `transform ${900 * pace}ms cubic-bezier(0.37, 0, 0.63, 1), filter ${900 * pace}ms cubic-bezier(0.37, 0, 0.63, 1), opacity ${900 * pace}ms cubic-bezier(0.37, 0, 0.63, 1)`,
            }}
          >
            <span
              ref={(node) => {
                marks.current[index] = node;
              }}
              role="img"
              aria-label={logo.name}
              className="block max-h-full bg-current"
              style={{
                backgroundImage: shimmer
                  ? `linear-gradient(110deg, transparent 36%, ${shine} 47%, ${shine} 53%, transparent 64%)`
                  : undefined,
                backgroundSize: "250% 100%",
                backgroundPosition: "150% 0",
                backgroundRepeat: "no-repeat",
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
          </li>
        );
      })}
    </ul>
  );
}

export { LogoMarquee };
