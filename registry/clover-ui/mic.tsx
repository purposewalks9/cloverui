"use client";

import * as React from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const micVariants = cva(
  "focus-visible:ring-ring inline-flex shrink-0 cursor-pointer items-center justify-center rounded-xl transition-opacity focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40",
  {
    variants: {
      color: {
        blue: "text-blue-500 dark:text-blue-400",
        purple: "text-purple-500 dark:text-purple-400",
        pink: "text-pink-500 dark:text-pink-400",
        emerald: "text-emerald-500 dark:text-emerald-400",
        orange: "text-orange-500 dark:text-orange-400",
        default: "text-foreground",
      },
      size: {
        sm: "size-10 text-2xl",
        default: "size-14 text-4xl",
        lg: "size-20 text-6xl",
      },
    },
    defaultVariants: { color: "blue", size: "default" },
  },
);

export type MicColor = NonNullable<VariantProps<typeof micVariants>["color"]>;
export type MicSize = NonNullable<VariantProps<typeof micVariants>["size"]>;
export type MicState = "idle" | "recording" | "blocked";

export interface MicProps extends Omit<
  React.ComponentProps<"button">,
  "color" | "children" | "type"
> {
  color?: MicColor;
  size?: MicSize;
  onStateChange?: (state: MicState) => void;
}

function useMicLevel(level: MotionValue<number>) {
  const stop = React.useRef<() => void>(() => {});
  const mounted = React.useRef(true);
  const reduceMotion = useReducedMotion();

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    if (!mounted.current) {
      stream.getTracks().forEach((track) => track.stop());
      return false;
    }
    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = 512;
    context.createMediaStreamSource(stream).connect(analyser);

    const samples = new Uint8Array(analyser.fftSize);
    let frame = 0;
    const read = () => {
      analyser.getByteTimeDomainData(samples);
      let sum = 0;
      for (const s of samples) sum += ((s - 128) / 128) ** 2;
      level.set(Math.min(1, Math.sqrt(sum / samples.length) * 5));
      frame = requestAnimationFrame(read);
    };
    if (reduceMotion) level.set(0.5);
    else read();

    stop.current = () => {
      cancelAnimationFrame(frame);
      stream.getTracks().forEach((track) => track.stop());
      context.close();
      level.set(0);
      stop.current = () => {};
    };
    return true;
  };

  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      stop.current();
    };
  }, []);
  return { start, stop: () => stop.current() };
}

function MuteSlash({
  muted,
  from,
  to,
  children,
}: {
  muted: boolean;
  from: [number, number];
  to: [number, number];
  children: React.ReactNode;
}) {
  const id = React.useId();
  const reduceMotion = useReducedMotion();
  const animate = { pathLength: muted ? 1 : 0, opacity: muted ? 1 : 0 };
  const transition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 420, damping: 32 };
  const line = {
    x1: from[0],
    y1: from[1],
    x2: to[0],
    y2: to[1],
    strokeLinecap: "round" as const,
    initial: false,
    animate,
    transition,
  };

  return (
    <>
      <mask id={id} maskUnits="userSpaceOnUse" x="-8" y="-8" width="48" height="48">
        <rect x="-8" y="-8" width="48" height="48" fill="white" />
        <motion.line {...line} stroke="black" strokeWidth={6.5} />
      </mask>
      <g mask={`url(#${id})`}>{children}</g>
      <motion.line {...line} stroke="currentColor" strokeWidth={2.4} />
    </>
  );
}

function Glyph({ level, muted }: { level: MotionValue<number>; muted: boolean }) {
  const barId = React.useId();
  const bar = useTransform(level, [0, 1], [0.55, 1]);

  return (
    <svg viewBox="0 0 24 32" className="h-[0.85em] w-[0.64em] overflow-visible" aria-hidden>
      <mask id={barId} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="32">
        <rect x="7" y="2" width="10" height="16" rx="5" fill="white" />
        <motion.rect
          x="10.6"
          y="5"
          width="2.8"
          height="10"
          rx="1.4"
          fill="black"
          style={{ scaleY: bar, originY: "10px", transformBox: "view-box" }}
        />
      </mask>
      <MuteSlash muted={muted} from={[3, 3]} to={[21, 29]}>
        <rect
          x="7"
          y="2"
          width="10"
          height="16"
          rx="5"
          fill="currentColor"
          mask={`url(#${barId})`}
        />
        <path
          d="M4 14a8 8 0 0 0 16 0M12 22v5M7.5 28h9"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
        />
      </MuteSlash>
    </svg>
  );
}

function Mic({ color, size, onStateChange, onClick, className, ...props }: MicProps) {
  const raw = useMotionValue(0);
  const level = useSpring(raw, { stiffness: 320, damping: 24, mass: 0.5 });
  const mic = useMicLevel(raw);
  const [state, setState] = React.useState<MicState>("idle");
  const [pending, setPending] = React.useState(false);
  const recording = state === "recording";

  const update = (next: MicState) => {
    setState(next);
    onStateChange?.(next);
  };

  const toggle = async (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || pending) return;
    if (recording) {
      mic.stop();
      update("idle");
      return;
    }
    setPending(true);
    try {
      if (await mic.start()) update("recording");
    } catch {
      update("blocked");
    } finally {
      setPending(false);
    }
  };

  const label = recording
    ? "Mute microphone"
    : state === "blocked"
      ? "Microphone blocked. Allow access to record"
      : "Unmute microphone";

  return (
    <button
      type="button"
      aria-label={label}
      aria-busy={pending || undefined}
      onClick={toggle}
      className={cn(micVariants({ color, size }), state === "blocked" && "opacity-40", className)}
      {...props}
    >
      <Glyph level={level} muted={!recording} />
    </button>
  );
}

export { Mic, micVariants };
