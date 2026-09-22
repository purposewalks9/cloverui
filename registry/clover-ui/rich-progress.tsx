"use client";

import * as React from "react";
import { motion, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

type Color =
  | "default"
  | "blue"
  | "purple"
  | "pink"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "teal"
  | "cyan"
  | "indigo"
  | "violet"
  | "rose"
  | "amber"
  | "lime"
  | "sky"
  | "slate"
  | "gray"
  | "zinc"
  | "neutral"
  | "stone"
  | "fuchsia"
  | "emerald";

type SizeVariant = "sm" | "default" | "lg";

export interface RichProgressProps {
  value: number;
  onChange?: (value: number) => void;
  color?: Color;
  size?: SizeVariant;
  showValue?: boolean;
  valueLabel?: string;
  knob?: boolean;
  sound?: boolean;
  soundVolume?: number;
  className?: string;
  trackClassName?: string;
  fillClassName?: string;
}

export interface RichProgressRef {
  playSound: () => void;
}

const fillColorMap: Record<Color, string> = {
  default: "from-zinc-900/85 to-zinc-900 dark:from-zinc-100/85 dark:to-zinc-100",
  emerald: "from-emerald-600/85 to-emerald-600 dark:from-emerald-600/75",
  blue: "from-blue-600/85 to-blue-600 dark:from-blue-600/75",
  purple: "from-purple-600/85 to-purple-600 dark:from-purple-600/75",
  pink: "from-pink-600/85 to-pink-600 dark:from-pink-600/75",
  red: "from-red-700/90 to-red-700 dark:from-red-700/80",
  orange: "from-orange-600/85 to-orange-600 dark:from-orange-600/75",
  yellow: "from-yellow-600/85 to-yellow-600 dark:from-yellow-600/75",
  green: "from-green-600/85 to-green-600 dark:from-green-600/75",
  teal: "from-teal-600/85 to-teal-600 dark:from-teal-600/75",
  cyan: "from-cyan-600/85 to-cyan-600 dark:from-cyan-600/75",
  indigo: "from-indigo-600/85 to-indigo-600 dark:from-indigo-600/75",
  violet: "from-violet-600/85 to-violet-600 dark:from-violet-600/75",
  rose: "from-rose-600/85 to-rose-600 dark:from-rose-600/75",
  amber: "from-amber-600/85 to-amber-600 dark:from-amber-600/75",
  lime: "from-lime-600/85 to-lime-600 dark:from-lime-600/75",
  sky: "from-sky-600/85 to-sky-600 dark:from-sky-600/75",
  slate: "from-slate-600/85 to-slate-600 dark:from-slate-600/75",
  gray: "from-gray-600/85 to-gray-600 dark:from-gray-600/75",
  zinc: "from-zinc-700/85 to-zinc-700 dark:from-zinc-700/75",
  neutral: "from-neutral-600/85 to-neutral-600 dark:from-neutral-600/75",
  stone: "from-stone-600/85 to-stone-600 dark:from-stone-600/75",
  fuchsia: "from-fuchsia-600/85 to-fuchsia-600 dark:from-fuchsia-600/75",
};

const sizeMap: Record<
  SizeVariant,
  { h: string; knob: string; text: string }
> = {
  sm: { h: "h-1.5", knob: "size-3", text: "text-xs" },
  default: { h: "h-2.5", knob: "size-4", text: "text-sm" },
  lg: { h: "h-3.5", knob: "size-5", text: "text-sm" },
};

function playRoughLoadSound(volume = 0.15) {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();

    const duration = 0.22;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const decay = 1 - i / bufferSize;
      data[i] = (Math.random() * 2 - 1) * decay * decay;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(650, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(
      180,
      ctx.currentTime + duration
    );
    filter.Q.value = 0.7;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + duration
    );

    noise.connect(filter).connect(gain).connect(ctx.destination);
    noise.start();
    noise.stop(ctx.currentTime + duration);
    noise.onended = () => ctx.close();
  } catch {}
}

const RichProgress = React.forwardRef<RichProgressRef, RichProgressProps>(
  (
    {
      value,
      onChange,
      color = "red",
      size = "default",
      showValue = true,
      valueLabel,
      knob = true,
      sound = false,
      soundVolume = 0.15,
      className,
      trackClassName,
      fillClassName,
    },
    ref
  ) => {
    const clamped = Math.min(100, Math.max(0, value));
    const { h, knob: knobSize, text } = sizeMap[size];

    const trackRef = React.useRef<HTMLDivElement>(null);
    const dragging = React.useRef(false);

    const springValue = useSpring(clamped, {
      stiffness: 180,
      damping: 24,
      mass: 0.45,
    });

    const width = useTransform(springValue, (v) => `${v}%`);

    const prevValue = React.useRef(clamped);

    const playSound = React.useCallback(
      () => playRoughLoadSound(soundVolume),
      [soundVolume]
    );

    React.useImperativeHandle(ref, () => ({ playSound }), [playSound]);

    React.useEffect(() => {
      springValue.set(clamped);

      const started = prevValue.current === 0 && clamped > 0;

      if (sound && started) {
        playSound();
      }

      prevValue.current = clamped;
    }, [clamped, sound, playSound, springValue]);

    const updateFromPointer = React.useCallback(
      (clientX: number) => {
        const track = trackRef.current;

        if (!track) return;

        const rect = track.getBoundingClientRect();

        const percentage =
          ((clientX - rect.left) / rect.width) * 100;

        const next = Math.round(
          Math.min(100, Math.max(0, percentage))
        );

        onChange?.(next);
      },
      [onChange]
    );

    const handlePointerDown = (
      event: React.PointerEvent<HTMLDivElement>
    ) => {
      dragging.current = true;

      event.currentTarget.setPointerCapture(event.pointerId);

      updateFromPointer(event.clientX);
    };

    const handlePointerMove = (
      event: React.PointerEvent<HTMLDivElement>
    ) => {
      if (!dragging.current) return;

      updateFromPointer(event.clientX);
    };

    const handlePointerUp = (
      event: React.PointerEvent<HTMLDivElement>
    ) => {
      dragging.current = false;

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    };

    return (
      <div
        className={cn(
          "w-full max-w-xl inline-flex items-center gap-3",
          className
        )}
      >
        <div
          ref={trackRef}
          role="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(clamped)}
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => {
            dragging.current = false;
          }}
          onKeyDown={(event) => {
            if (!onChange) return;

            if (event.key === "ArrowRight" || event.key === "ArrowUp") {
              event.preventDefault();
              onChange(Math.min(100, clamped + 1));
            }

            if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
              event.preventDefault();
              onChange(Math.max(0, clamped - 1));
            }

            if (event.key === "Home") {
              event.preventDefault();
              onChange(0);
            }

            if (event.key === "End") {
              event.preventDefault();
              onChange(100);
            }
          }}
          className={cn(
            "relative flex-1 min-w-0 cursor-ew-resize touch-none",
            "rounded-full overflow-visible select-none",
            "bg-linear-to-b from-zinc-800 to-zinc-900",
            "dark:from-zinc-800 dark:to-zinc-950",
            "border border-zinc-950/35",
            "shadow-inner shadow-black/40",
            "outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/40",
            h,
            trackClassName
          )}
        >
          <motion.div
            className={cn(
              "relative h-full rounded-full overflow-hidden",
              "bg-linear-to-b dark:bg-linear-to-t",
              "border border-zinc-950/35",
              "inset-shadow-2xs inset-shadow-white/25",
              "shadow-md shadow-zinc-950/20",
              fillColorMap[color],
              fillClassName
            )}
            style={{ width }}
          >
            <motion.span
              aria-hidden
              className="absolute inset-y-0 w-1/3 bg-linear-to-r from-white/0 via-white/25 to-white/0"
              animate={{ x: ["-120%", "320%"] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </motion.div>

          {knob && (
            <motion.div
              aria-hidden
              className={cn(
                "pointer-events-none absolute top-1/2",
                "-translate-x-1/2 -translate-y-1/2",
                "rounded-full bg-white",
                "shadow-md shadow-black/40",
                "ring-1 ring-black/10",
                "transition-transform",
                dragging.current && "scale-110",
                knobSize
              )}
              style={{ left: width }}
            >
              <span
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 30% 25%, rgba(255,255,255,1), rgba(255,255,255,0.4) 60%)",
                }}
              />
            </motion.div>
          )}
        </div>

        {showValue && (
          <span
            className={cn(
              "min-w-8 shrink-0 text-right tabular-nums",
              "text-zinc-400 dark:text-zinc-500",
              text
            )}
          >
            {valueLabel ?? Math.round(clamped)}
          </span>
        )}
      </div>
    );
  }
);

RichProgress.displayName = "RichProgress";

export { RichProgress };