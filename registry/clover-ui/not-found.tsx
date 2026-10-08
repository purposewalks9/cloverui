"use client";

import * as React from "react";
import { motion, useReducedMotion, useSpring } from "motion/react";

import { cn } from "@/lib/utils";

export interface NotFoundProps extends Omit<React.ComponentProps<"section">, "title"> {
  description?: React.ReactNode;
  actionLabel?: string;
  href?: string;
  onAction?: () => void;
}

const MOUTH = {
  sad: "M37 72 Q50 61 63 72 Q50 64 37 72 Z",
  happy: "M31 58 Q50 58 69 58 Q50 86 31 58 Z",
};

const BROW = {
  sad: { left: "M30 38 L42 34", right: "M70 38 L58 34" },
  happy: { left: "M30 32 L42 32", right: "M70 32 L58 32" },
};

const LOOK = { stiffness: 260, damping: 22, mass: 0.6 };

function Face({ happy }: { happy: boolean }) {
  const reduceMotion = useReducedMotion();
  const ref = React.useRef<SVGSVGElement>(null);
  const x = useSpring(0, LOOK);
  const y = useSpring(0, LOOK);
  const mood = happy ? "happy" : "sad";
  const [drawn, setDrawn] = React.useState(false);
  const ease = reduceMotion
    ? { duration: 0 }
    : { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const };

  React.useEffect(() => {
    if (reduceMotion) return;
    const onMove = (event: PointerEvent) => {
      const box = ref.current?.getBoundingClientRect();
      if (!box) return;
      const dx = event.clientX - (box.left + box.width / 2);
      const dy = event.clientY - (box.top + box.height / 2);
      const distance = Math.hypot(dx, dy) || 1;
      const pull = Math.min(1, distance / 320) * 5;
      x.set((dx / distance) * pull);
      y.set((dy / distance) * pull);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduceMotion, x, y]);

  return (
    <svg
      ref={ref}
      viewBox="0 0 100 100"
      aria-hidden
      className="mx-[0.02em] size-[0.74em] shrink-0 overflow-visible"
    >
      <circle cx="50" cy="50" r="38" className="fill-muted" />
      {drawn || reduceMotion ? (
        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="16" />
      ) : (
        <motion.circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="currentColor"
          strokeWidth="16"
          initial={{ pathLength: 0, rotate: -90 }}
          animate={{ pathLength: 1, rotate: -90 }}
          transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
          onAnimationComplete={() => setDrawn(true)}
        />
      )}

      <motion.g style={{ x, y }} className="fill-current stroke-current">
        <motion.path
          initial={false}
          animate={{ d: BROW[mood].left, opacity: happy ? 0 : 1 }}
          transition={ease}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <motion.path
          initial={false}
          animate={{ d: BROW[mood].right, opacity: happy ? 0 : 1 }}
          transition={ease}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <motion.g
          animate={reduceMotion ? undefined : { scaleY: [1, 1, 0.1, 1] }}
          transition={{ duration: 4, times: [0, 0.93, 0.96, 1], repeat: Infinity }}
        >
          <motion.ellipse
            cx="38"
            initial={false}
            animate={{ cy: happy ? 44 : 47, ry: happy ? 7.5 : 5 }}
            transition={ease}
            rx="5.5"
            stroke="none"
          />
          <motion.ellipse
            cx="62"
            initial={false}
            animate={{ cy: happy ? 44 : 47, ry: happy ? 7.5 : 5 }}
            transition={ease}
            rx="5.5"
            stroke="none"
          />
        </motion.g>

        <motion.path
          initial={false}
          animate={{ d: MOUTH[mood] }}
          transition={ease}
          strokeWidth="4"
          strokeLinejoin="round"
        />
      </motion.g>
    </svg>
  );
}

function NotFound({
  description = "We've searched everywhere, but we couldn't find what you were looking for. Maybe it existed once, but now it's gone.",
  actionLabel = "Back to home",
  href = "/",
  onAction,
  className,
  ...props
}: NotFoundProps) {
  const [happy, setHappy] = React.useState(false);

  const cheer = {
    onPointerEnter: () => setHappy(true),
    onPointerLeave: () => setHappy(false),
    onFocus: () => setHappy(true),
    onBlur: () => setHappy(false),
  };

  return (
    <section
      className={cn("text-foreground flex flex-col items-center px-6 py-16 text-center", className)}
      {...props}
    >
      <h1 className="flex items-center text-[clamp(6rem,22vw,11rem)] leading-none font-semibold tracking-tight">
        <span aria-hidden>4</span>
        <Face happy={happy} />
        <span aria-hidden>4</span>
        <span className="sr-only">404, page not found</span>
      </h1>

      <p className="text-muted-foreground mt-6 max-w-[26rem] text-base leading-relaxed text-pretty sm:text-lg">
        {description}
      </p>

      {onAction ? (
        <button
          type="button"
          onClick={onAction}
          {...cheer}
          className="bg-muted text-foreground/80 hover:text-foreground hover:bg-accent focus-visible:ring-ring mt-8 cursor-pointer rounded-full px-5 py-2.5 text-base font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2"
        >
          {actionLabel}
        </button>
      ) : (
        <a
          href={href}
          {...cheer}
          className="bg-muted text-foreground/80 hover:text-foreground hover:bg-accent focus-visible:ring-ring mt-8 rounded-full px-5 py-2.5 text-base font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2"
        >
          {actionLabel}
        </a>
      )}
    </section>
  );
}

export { NotFound };
