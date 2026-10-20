"use client";

import * as React from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { Brain } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EffortSliderProps extends Omit<
  React.ComponentProps<"div">,
  "defaultValue" | "onChange" | "children"
> {
  levels?: string[];
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number, level: string) => void;
  recommended?: number;
  tags?: string[];
  theme?: EffortSliderTheme;
  label?: string;
  disabled?: boolean;
}

const HEIGHT = 24;
const INSET = 12;
const KNOB = 30;

const SNAP = { duration: 0.22, ease: [0.22, 1, 0.36, 1] } as const;

const SLAM = { duration: 0.15, ease: [0.55, 0, 0.9, 0.6] } as const;

const DEFAULT_LEVELS = ["Low", "Medium", "High", "Max"];

const DEFAULT_TAGS = ["Fastest", "Faster", "Smarter", "Smartest"];

const PARTICLES = [
  { top: 18, size: 2, delay: 0, twinkle: 1.1 },
  { top: 62, size: 1.5, delay: -0.7, twinkle: 0.8 },
  { top: 38, size: 2, delay: -1.6, twinkle: 1.3 },
  { top: 80, size: 1.5, delay: -2.3, twinkle: 0.9 },
  { top: 28, size: 1.5, delay: -3.1, twinkle: 1.2 },
  { top: 50, size: 2, delay: -3.8, twinkle: 0.7 },
  { top: 72, size: 2, delay: -4.6, twinkle: 1 },
  { top: 12, size: 1.5, delay: -5.2, twinkle: 1.4 },
  { top: 44, size: 1.5, delay: -1.1, twinkle: 0.9 },
  { top: 86, size: 2, delay: -2.8, twinkle: 1.1 },
  { top: 24, size: 2, delay: -4.1, twinkle: 0.8 },
  { top: 56, size: 1.5, delay: -5.6, twinkle: 1.2 },
];

export type EffortSliderTheme = "aurora" | "ocean" | "ember" | "forest" | "mono";

type Tone = { light: string; dark: string; brain: string; line: string };

type Palette = {
  tones: Tone[];
  max: { light: string; dark: string; glowLight: string; glowDark: string };
};

const THEMES: Record<EffortSliderTheme, Palette> = {
  aurora: {
    tones: [
      { light: "#9a9cc8", dark: "#3b3d63", brain: "#b4b7ee", line: "#262850" },
      { light: "#a596c6", dark: "#4a3d6b", brain: "#c3aef0", line: "#33245c" },
      { light: "#c69aae", dark: "#6a3a56", brain: "#f9a8d4", line: "#6b1530" },
    ],
    max: {
      light: "#e26d88",
      dark: "#b4455a",
      glowLight: "rgb(255 255 255 / 0.18)",
      glowDark: "rgb(255 150 170 / 0.35)",
    },
  },
  ocean: {
    tones: [
      { light: "#8fb3c9", dark: "#2c4a5e", brain: "#a9d8f0", line: "#163447" },
      { light: "#7fb0d6", dark: "#2e5379", brain: "#9cc9f5", line: "#183a5c" },
      { light: "#7fc3c4", dark: "#285e63", brain: "#8fe3dc", line: "#0f4247" },
    ],
    max: {
      light: "#36a9bb",
      dark: "#2a8a99",
      glowLight: "rgb(255 255 255 / 0.18)",
      glowDark: "rgb(140 230 240 / 0.35)",
    },
  },
  ember: {
    tones: [
      { light: "#d9b38c", dark: "#5e4429", brain: "#f5c99a", line: "#4a2f14" },
      { light: "#e3a37f", dark: "#6b3a24", brain: "#f7b48f", line: "#55240f" },
      { light: "#e58f8f", dark: "#6e2a2a", brain: "#ff9e9e", line: "#5a1414" },
    ],
    max: {
      light: "#e0573a",
      dark: "#b8432a",
      glowLight: "rgb(255 255 255 / 0.18)",
      glowDark: "rgb(255 180 130 / 0.35)",
    },
  },
  forest: {
    tones: [
      { light: "#a7c4a0", dark: "#33503a", brain: "#b6e3ad", line: "#1c3a22" },
      { light: "#9cc79b", dark: "#2f5a3b", brain: "#a8e6a8", line: "#173f22" },
      { light: "#c3cf8a", dark: "#535d25", brain: "#e2f09a", line: "#3a4210" },
    ],
    max: {
      light: "#93b83a",
      dark: "#6f8f1f",
      glowLight: "rgb(255 255 255 / 0.18)",
      glowDark: "rgb(210 240 140 / 0.35)",
    },
  },
  mono: {
    tones: [
      { light: "#c4c4c9", dark: "#3a3a3f", brain: "#d4d4d8", line: "#27272a" },
      { light: "#b0b0b7", dark: "#46464d", brain: "#e4e4e7", line: "#27272a" },
      { light: "#9b9ba3", dark: "#55555c", brain: "#fafafa", line: "#18181b" },
    ],
    max: {
      light: "#6a6a73",
      dark: "#8a8a93",
      glowLight: "rgb(255 255 255 / 0.2)",
      glowDark: "rgb(255 255 255 / 0.25)",
    },
  },
};

const BACKING = [
  { cx: 9, cy: 5, r: 3 },
  { cx: 15, cy: 5, r: 3 },
  { cx: 7, cy: 9, r: 4 },
  { cx: 17, cy: 9, r: 4 },
  { cx: 6, cy: 14, r: 4 },
  { cx: 18, cy: 14, r: 4 },
  { cx: 8, cy: 18, r: 4 },
  { cx: 16, cy: 18, r: 4 },
];

function BrainKnob() {
  return (
    <span className="relative block size-full">
      <svg aria-hidden viewBox="0 0 24 24" className="absolute inset-0 size-full">
        <g className="fill-(--effort-brain)">
          {BACKING.map((lobe) => (
            <circle key={`${lobe.cx}-${lobe.cy}`} {...lobe} />
          ))}
          <rect x="7" y="5" width="10" height="14" />
        </g>
      </svg>
      <Brain
        aria-hidden
        strokeWidth={2.6}
        className="absolute inset-0 size-full text-(--effort-line)"
      />
    </span>
  );
}

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const TRAIL = 140;

const DRIFT_CSS =
  "@keyframes effort-slider-drift-a{from{transform:translate3d(-20%,0,0)}to{transform:translate3d(20%,0,0)}}" +
  "@keyframes effort-slider-flow{0%{transform:translate3d(0,0,0);opacity:0}12%{opacity:1}88%{opacity:1}100%{transform:translate3d(100%,0,0);opacity:0}}" +
  "@keyframes effort-slider-twinkle{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.35;transform:scale(0.6)}}";

const stopAt = (index: number, count: number) => (count <= 1 ? 1 : index / (count - 1));

const RESTING = { light: "#a1a1aa", dark: "#3f3f46", brain: "#a1a1aa", line: "#3f3f46" };

const toneFor = (index: number, count: number, tones: Tone[]) => {
  if (index <= 0 && count > 1) return RESTING;
  const top = Math.max(1, count - 1);
  const step = Math.round(((clamp(index, 1, top) - 1) / Math.max(1, top - 1)) * (tones.length - 1));
  return tones[step];
};

function effortTone(index: number, count: number, theme: EffortSliderTheme = "aurora") {
  return toneFor(index, count, (THEMES[theme] ?? THEMES.aurora).tones);
}

const maxGradient = (palette: Palette, count: number, mode: "light" | "dark") => {
  const segments = Math.max(1, count - 1);
  const hot = palette.max[mode];
  const stops = Array.from({ length: segments }, (_, k) => {
    const middle = (((k + 0.5) / segments) * 100).toFixed(1);
    if (k === segments - 1) return `${hot} ${middle}%`;
    const level = toneFor(k + 1, count, palette.tones);
    const tone =
      mode === "light" ? `color-mix(in oklab, ${level.light} 80%, ${level.line})` : level.dark;
    return `color-mix(in oklab, ${tone} 72%, ${hot}) ${middle}%`;
  });
  const glow = mode === "light" ? palette.max.glowLight : palette.max.glowDark;
  return `radial-gradient(70px 140% at 100% 50%, ${glow}, transparent), linear-gradient(90deg, ${stops.join(", ")}, ${hot} 100%)`;
};

const leftAt = (fraction: number) => `calc(${INSET}px + (100% - ${INSET * 2}px) * ${fraction})`;

function EffortSlider({
  levels = DEFAULT_LEVELS,
  value,
  defaultValue,
  onValueChange,
  recommended,
  theme = "aurora",
  tags = DEFAULT_TAGS,
  label = "Effort",
  disabled = false,
  className,
  style,
  ...props
}: EffortSliderProps) {
  const reduceMotion = useReducedMotion();
  const count = Math.max(1, levels.length);
  const last = count - 1;
  const [inner, setInner] = React.useState(() => Math.round(clamp(defaultValue ?? 1, 0, last)));
  const current = Math.round(clamp(value ?? inner, 0, last));
  const level = levels[current] ?? "";
  const palette = THEMES[theme] ?? THEMES.aurora;
  const tone = toneFor(current, count, palette.tones);
  const maxed = count > 1 && current === last;
  const tag =
    recommended !== undefined && Math.round(recommended) === current
      ? "Recommended"
      : (tags[current] ?? "");
  const particlesRef = React.useRef<HTMLSpanElement | null>(null);

  React.useEffect(() => {
    const host = particlesRef.current;
    if (!host || typeof host.getAnimations !== "function") return;
    const rate = 0.5 + stopAt(current, count) * 2.5;
    for (const animation of host.getAnimations({ subtree: true })) {
      if ("animationName" in animation && animation.animationName === "effort-slider-flow") {
        animation.updatePlaybackRate(rate);
      }
    }
  }, [current, count, reduceMotion]);

  const [start] = React.useState(() => stopAt(current, count));
  const head = useMotionValue(start);
  const draggingRef = React.useRef(false);
  const movedRef = React.useRef(false);
  const pressXRef = React.useRef(0);
  const pressIndexRef = React.useRef(0);
  const targetRef = React.useRef<number | null>(null);
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const fillRef = React.useRef<HTMLDivElement | null>(null);
  const thumbRef = React.useRef<HTMLDivElement | null>(null);
  const trailRef = React.useRef<HTMLDivElement | null>(null);

  const commit = React.useCallback(
    (next: number) => {
      const index = Math.round(clamp(next, 0, last));
      if (index === current) return;
      if (value === undefined) setInner(index);
      onValueChange?.(index, levels[index] ?? "");
    },
    [current, last, levels, onValueChange, value],
  );

  const moveTo = React.useCallback(
    (fraction: number) => {
      if (targetRef.current === fraction && head.isAnimating()) return;
      targetRef.current = fraction;
      if (reduceMotion) head.jump(fraction);
      else animate(head, fraction, count > 1 && fraction >= 1 ? SLAM : SNAP);
    },
    [count, head, reduceMotion],
  );

  React.useEffect(() => {
    if (draggingRef.current) return;
    moveTo(stopAt(current, count));
  }, [current, count, moveTo]);

  React.useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let width = track.getBoundingClientRect().width;
    const fill = fillRef.current;
    const thumb = thumbRef.current;
    if (thumb) thumb.style.left = "0px";
    const streak = trailRef.current;
    const edgeAt = () => INSET + clamp(head.get()) * (width - INSET * 2);
    let length = 0;
    let pace = 0;
    let side = -1;
    let lastEdge = edgeAt();
    let lastTime = 0;
    let frame = 0;
    const sweep = (now: number) => {
      const dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 1 / 60;
      lastTime = now;
      const edge = edgeAt();
      const speed = (edge - lastEdge) / Math.max(dt, 1 / 240);
      lastEdge = edge;
      pace += (speed - pace) * Math.min(1, dt * 10);
      if (Math.abs(pace) > 30) side = pace > 0 ? -1 : 1;
      const target = Math.min(TRAIL, Math.abs(pace) * 0.1);
      length += (target - length) * Math.min(1, dt * (target > length ? 18 : 7));
      if (streak) {
        streak.style.transform = `translate3d(${edge.toFixed(2)}px, 0, 0) scaleX(${((side * length) / TRAIL).toFixed(3)})`;
        streak.style.opacity = Math.min(1, length / 36).toFixed(3);
      }
      if (length > 0.5 || Math.abs(pace) > 1) {
        frame = requestAnimationFrame(sweep);
      } else {
        frame = 0;
        lastTime = 0;
        length = 0;
        pace = 0;
        if (streak) streak.style.opacity = "0";
      }
    };
    const place = () => {
      if (!width) return;
      const edge = edgeAt();
      if (fill) {
        fill.style.transform = `translate3d(${(edge - width).toFixed(2)}px, 0, 0)`;
        fill.style.opacity = clamp((edge - INSET) / 10).toFixed(3);
      }
      if (thumb) thumb.style.transform = `translate3d(${(edge - KNOB / 2).toFixed(2)}px, 0, 0)`;
      if (streak && !frame && !reduceMotion) frame = requestAnimationFrame(sweep);
    };
    place();
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            width = track.getBoundingClientRect().width;
            place();
          });
    observer?.observe(track);
    const unsubscribe = head.on("change", place);
    return () => {
      unsubscribe();
      observer?.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [head, reduceMotion]);

  const fractionAt = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= INSET * 2) return head.get();
    return clamp((clientX - rect.left - INSET) / (rect.width - INSET * 2));
  };

  const nearestStop = (fraction: number) => (count <= 1 ? 0 : Math.round(fraction * last));

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus({ preventScroll: true });
    draggingRef.current = true;
    movedRef.current = false;
    pressXRef.current = event.clientX;
    pressIndexRef.current = nearestStop(fractionAt(event.clientX));
    moveTo(stopAt(pressIndexRef.current, count));
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    if (!movedRef.current && Math.abs(event.clientX - pressXRef.current) < 4) return;
    movedRef.current = true;
    head.jump(fractionAt(event.clientX));
  };

  const release = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const index = movedRef.current ? nearestStop(fractionAt(event.clientX)) : pressIndexRef.current;
    commit(index);
    moveTo(stopAt(index, count));
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const keys: Record<string, number> = {
      ArrowRight: current + 1,
      ArrowUp: current + 1,
      ArrowLeft: current - 1,
      ArrowDown: current - 1,
      PageUp: current + 1,
      PageDown: current - 1,
      Home: 0,
      End: last,
    };
    if (!(event.key in keys)) return;
    event.preventDefault();
    commit(keys[event.key]);
  };

  return (
    <div
      data-slot="effort-slider"
      data-disabled={disabled || undefined}
      className={cn(
        "bg-card text-card-foreground w-full max-w-xs rounded-lg border-2 border-[color-mix(in_oklab,var(--card),var(--foreground)_8%)] p-4 select-none dark:border-[color-mix(in_oklab,var(--card),var(--foreground)_12%)] dark:bg-[color-mix(in_oklab,var(--card),var(--foreground)_6%)]",
        "[--effort-fill:color-mix(in_oklab,var(--effort-fill-light)_80%,var(--effort-line))] dark:[--effort-fill:var(--effort-fill-dark)]",
        "[--effort-max:var(--effort-max-light)] dark:[--effort-max:var(--effort-max-dark)]",
        disabled && "opacity-50",
        className,
      )}
      style={
        {
          "--effort-fill-light": tone.light,
          "--effort-fill-dark": tone.dark,
          "--effort-brain": tone.brain,
          "--effort-line": tone.line,
          "--effort-max-light": maxGradient(palette, count, "light"),
          "--effort-max-dark": maxGradient(palette, count, "dark"),
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {!reduceMotion && (
        <style href="effort-slider-drift" precedence="default">
          {DRIFT_CSS}
        </style>
      )}
      <div className="flex items-center justify-between gap-3 text-sm whitespace-nowrap">
        <div className="flex min-w-0 items-baseline gap-1.5">
          <span className="text-muted-foreground shrink-0">{label}</span>
          <span className="inline-grid">
            <AnimatePresence initial={false}>
              <motion.span
                key={level}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: "0.25em" }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: "-0.25em" }}
                transition={{ duration: reduceMotion ? 0 : 0.4, ease: [0.32, 0.72, 0, 1] }}
                className="text-[13px] font-medium text-(--effort-line) [grid-area:1/1] dark:text-(--effort-brain)"
              >
                {level}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>
        <span className="inline-grid shrink-0 justify-items-end">
          <AnimatePresence initial={false}>
            {tag && (
              <motion.span
                key={tag}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
                className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-xs [grid-area:1/1] dark:bg-[color-mix(in_oklab,var(--card),var(--foreground)_12%)]"
              >
                {tag}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </div>

      <div
        ref={trackRef}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={last}
        aria-valuenow={current}
        aria-valuetext={level}
        aria-disabled={disabled || undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={release}
        onPointerCancel={release}
        onKeyDown={onKeyDown}
        className={cn(
          "group/effort relative mt-4 touch-none [contain:layout_style] outline-none",
          disabled ? "pointer-events-none" : "cursor-pointer",
        )}
        style={{ height: HEIGHT }}
      >
        <div className="bg-muted absolute inset-0 overflow-hidden rounded-[5px]">
          <div aria-hidden className="absolute inset-0">
            <div
              ref={fillRef}
              className="absolute inset-y-0 left-0 w-full [mask-image:linear-gradient(90deg,rgb(0_0_0/0.6),rgb(0_0_0/0.6)_calc(100%_-_240px),#000_100%)] will-change-transform"
              style={{
                transform: `translateX(calc(${leftAt(start)} - 100%))`,
                opacity: start > 0 ? 1 : 0,
              }}
            >
              <span className="absolute inset-0 bg-(--effort-fill) transition-[background-color] duration-300" />
              <span
                className={cn(
                  "absolute inset-0 bg-(image:--effort-max) transition-opacity duration-300",
                  maxed ? "opacity-100" : "opacity-0",
                )}
              />
              {!reduceMotion && (
                <span
                  className="absolute inset-y-0 -left-1/2 w-[200%] bg-[linear-gradient(90deg,transparent_20%,color-mix(in_oklab,var(--effort-brain)_14%,transparent)_50%,transparent_80%)] will-change-transform"
                  style={{
                    animation: "effort-slider-drift-a 6s ease-in-out infinite alternate",
                    animationPlayState: current === 0 ? "paused" : "running",
                  }}
                />
              )}
              {!reduceMotion && (
                <span ref={particlesRef} className="absolute inset-0">
                  {PARTICLES.map((particle, index) => (
                    <span
                      key={index}
                      className="absolute inset-0 will-change-transform"
                      style={{
                        animation: `effort-slider-flow 6s linear ${particle.delay}s infinite`,
                        animationPlayState: current === 0 ? "paused" : "running",
                      }}
                    >
                      <span
                        className="absolute left-0 rounded-full bg-[color-mix(in_oklab,var(--effort-line)_75%,var(--effort-brain))] shadow-[0_0_4px_var(--effort-brain)] dark:bg-(--effort-brain)"
                        style={{
                          top: `${particle.top}%`,
                          width: particle.size,
                          height: particle.size,
                          animation: `effort-slider-twinkle ${particle.twinkle}s ease-in-out infinite`,
                        }}
                      />
                    </span>
                  ))}
                </span>
              )}
            </div>
          </div>
          <div
            ref={trailRef}
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 origin-left bg-[linear-gradient(90deg,var(--effort-streak),transparent)] [mask-image:repeating-linear-gradient(180deg,#000_0_4px,rgb(0_0_0/0.35)_4px_8px)] opacity-0 will-change-transform [--effort-streak:color-mix(in_oklab,var(--effort-line)_60%,var(--effort-brain))] dark:[mask-image:repeating-linear-gradient(180deg,#000_0_4px,rgb(0_0_0/0.55)_4px_8px)] dark:[--effort-streak:var(--effort-brain)]"
            style={{ width: TRAIL }}
          />
          {levels.map((name, index) => {
            const marked = recommended !== undefined && Math.round(recommended) === index;
            return (
              <span
                key={`${name}-${index}`}
                aria-hidden
                className={cn(
                  "absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[width,height,background-color] duration-150 ease-out",
                  marked ? "h-[10px] w-[3px]" : index === 0 ? "h-1 w-0.5" : "h-[7px] w-0.5",
                  index < current && current > 0
                    ? marked
                      ? "bg-white/90"
                      : "bg-white/60"
                    : marked
                      ? "bg-muted-foreground/70"
                      : "bg-muted-foreground/40",
                  index === current && "opacity-0",
                )}
                style={{ left: leftAt(stopAt(index, count)) }}
              />
            );
          })}
        </div>
        <div
          ref={thumbRef}
          aria-hidden
          className="pointer-events-none absolute will-change-transform"
          style={{
            width: KNOB,
            height: KNOB,
            top: (HEIGHT - KNOB) / 2,
            left: leftAt(start),
            transform: "translateX(-50%)",
          }}
        >
          <span className="block size-full">
            <BrainKnob />
          </span>
        </div>
      </div>
    </div>
  );
}

EffortSlider.displayName = "EffortSlider";

export { EffortSlider, BrainKnob, effortTone };
