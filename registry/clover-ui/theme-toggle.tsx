"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

const themeToggleVariants = cva(
  [
    "group relative inline-flex h-[2.8em] w-[5.6em] shrink-0 cursor-pointer rounded-full p-[0.2em] outline-none select-none",
    "transition-[scale] duration-300 ease-[cubic-bezier(0.34,1.35,0.64,1)] active:scale-[0.96] active:duration-100 active:ease-out motion-reduce:active:scale-100",
    "bg-[linear-gradient(180deg,#323232,#050505)]",
    "shadow-[0_0.2em_0.5em_rgb(0_0_0/0.45),0_0.05em_0.1em_rgb(0_0_0/0.6),inset_0_0.06em_0_rgb(255_255_255/0.14),inset_0_-0.04em_0_rgb(255_255_255/0.05)]",
    "focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ],
  {
    variants: {
      size: {
        sm: "text-[12px]",
        default: "text-[16px]",
        lg: "text-[20px]",
      },
    },
    defaultVariants: { size: "default" },
  },
);

export type ThemeToggleSize = NonNullable<VariantProps<typeof themeToggleVariants>["size"]>;
export type ThemeToggleTheme = "light" | "dark";

export interface ThemeToggleProps
  extends
    Omit<React.ComponentProps<"button">, "onClick" | "children">,
    VariantProps<typeof themeToggleVariants> {
  theme?: ThemeToggleTheme;
  onThemeChange?: (theme: ThemeToggleTheme) => void;
  lightColor?: string;
  darkColor?: string;
}

type Ripple = { id: number; x: number; y: number; size: number };

const subscribe = () => () => {};

const RIM_MASK = {
  mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
  WebkitMask: "linear-gradient(#000 0 0) content-box xor, linear-gradient(#000 0 0)",
} satisfies React.CSSProperties;

function Sun() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      className="size-full"
    >
      <circle cx="12" cy="12" r="4.2" fill="currentColor" stroke="none" />
      <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.55 1.55M17.15 17.15l1.55 1.55M5.3 18.7l1.55-1.55M17.15 6.85l1.55-1.55" />
    </svg>
  );
}

function Moon() {
  return (
    <svg viewBox="0 0 24 24" className="size-full" fill="currentColor">
      <path d="M20.2 14.6A8.6 8.6 0 0 1 9.4 3.8a.6.6 0 0 0-.8-.7A9.4 9.4 0 1 0 20.9 15.4a.6.6 0 0 0-.7-.8Z" />
    </svg>
  );
}

function ThemeToggle({
  theme,
  onThemeChange,
  lightColor = "#41ad6d",
  darkColor = "#25272d",
  size = "default",
  className,
  style,
  disabled,
  onPointerMove,
  onPointerDown,
  ...props
}: ThemeToggleProps) {
  const reduceMotion = useReducedMotion();
  const trackRef = React.useRef<HTMLSpanElement>(null);
  const rippleId = React.useRef(0);
  const [ripples, setRipples] = React.useState<Ripple[]>([]);
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const current = theme ?? (mounted ? resolvedTheme : undefined);
  const dark = current === "dark";
  const ready = mounted && current !== undefined;

  const spring = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 520, damping: 34, mass: 0.9 };

  const icon = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scale: 0.4, rotate: -90, filter: "blur(3px)" },
        animate: { opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" },
        exit: { opacity: 0, scale: 0.4, rotate: 90, filter: "blur(3px)" },
      };

  const track = (target: HTMLButtonElement, clientX: number, clientY: number) => {
    const rect = target.getBoundingClientRect();
    target.style.setProperty("--tt-x", `${clientX - rect.left}px`);
    target.style.setProperty("--tt-y", `${clientY - rect.top}px`);
  };

  const ripple = (clientX?: number, clientY?: number) => {
    const area = trackRef.current;
    if (!area || reduceMotion) return;
    const rect = area.getBoundingClientRect();
    const x = clientX === undefined ? rect.width / 2 : clientX - rect.left;
    const y = clientY === undefined ? rect.height / 2 : clientY - rect.top;
    const size = 2 * Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y));
    const id = ++rippleId.current;
    setRipples((current) => [...current, { id, x, y, size }]);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      disabled={disabled}
      className={cn(themeToggleVariants({ size }), className)}
      style={{ "--tt-x": "50%", "--tt-y": "50%", ...style } as React.CSSProperties}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        track(event.currentTarget, event.clientX, event.clientY);
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        track(event.currentTarget, event.clientX, event.clientY);
        ripple(event.clientX, event.clientY);
      }}
      onClick={(event) => {
        if (event.detail === 0) ripple();
        const next: ThemeToggleTheme = dark ? "light" : "dark";
        if (theme === undefined) setTheme(next);
        onThemeChange?.(next);
      }}
      {...props}
    >
      <motion.span
        key={ready ? "ready" : "pending"}
        ref={trackRef}
        className={cn(
          "relative block size-full overflow-hidden rounded-full shadow-[inset_0_0.12em_0.3em_rgb(0_0_0/0.5),inset_0_-0.04em_0.06em_rgb(255_255_255/0.12)]",
          !ready && "bg-(--tt-light) dark:bg-(--tt-dark)",
        )}
        style={{ "--tt-light": lightColor, "--tt-dark": darkColor } as React.CSSProperties}
        initial={false}
        animate={ready ? { backgroundColor: dark ? darkColor : lightColor } : undefined}
        transition={{ duration: ready && !reduceMotion ? 0.35 : 0, ease: "easeOut" }}
      >
        <span className="pointer-events-none absolute inset-x-[12%] top-0 h-1/2 rounded-b-full bg-linear-to-b from-white/18 to-transparent" />

        <AnimatePresence initial={false} mode="popLayout">
          {ready && (
            <motion.span
              key={dark ? "moon" : "sun"}
              aria-hidden
              className={cn(
                "absolute top-1/2 -mt-[0.6em] size-[1.2em] drop-shadow-[0_0.04em_0.06em_rgb(0_0_0/0.35)]",
                dark ? "right-[0.85em] text-[#e9e9f2]" : "left-[0.85em] text-white",
              )}
              {...icon}
              transition={{ duration: reduceMotion ? 0.15 : 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {dark ? <Moon /> : <Sun />}
            </motion.span>
          )}
        </AnimatePresence>

        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(4.5em circle at calc(var(--tt-x) - 0.2em) calc(var(--tt-y) - 0.2em), rgb(255 255 255 / 0.2), transparent 70%)",
          }}
        />

        {ripples.map((item) => (
          <motion.span
            key={item.id}
            aria-hidden
            className="pointer-events-none absolute rounded-full bg-white/30"
            style={{
              left: item.x - item.size / 2,
              top: item.y - item.size / 2,
              width: item.size,
              height: item.size,
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={() =>
              setRipples((current) => current.filter(({ id }) => id !== item.id))
            }
          />
        ))}

        <motion.span
          aria-hidden
          className={cn(
            "absolute top-[0.1em] left-[0.1em] size-[2.2em] rounded-full transition-[scale] duration-200 group-active:scale-x-[1.08]",
            !ready && "translate-x-[2.8em] dark:translate-x-0",
          )}
          initial={false}
          animate={ready ? { x: dark ? "0em" : "2.8em" } : undefined}
          transition={ready ? spring : { duration: 0 }}
          style={{
            background: "radial-gradient(circle at 38% 30%, #4b4b4b 0%, #1b1b1b 42%, #070707 78%)",
            boxShadow:
              "0 0.14em 0.35em rgb(0 0 0 / 0.55), -0.12em 0 0.3em rgb(0 0 0 / 0.35), inset 0 0.07em 0.06em rgb(255 255 255 / 0.2), inset 0 -0.1em 0.2em rgb(0 0 0 / 0.6)",
          }}
        >
          <span className="absolute inset-[0.14em] rounded-full bg-[radial-gradient(circle_at_40%_28%,rgb(255_255_255/0.16),transparent_55%)]" />
        </motion.span>
      </motion.span>

      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full p-[0.2em] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          ...RIM_MASK,
          background:
            "radial-gradient(3.4em circle at var(--tt-x) var(--tt-y), rgb(255 255 255 / 0.55), transparent 75%)",
        }}
      />
    </button>
  );
}

export { ThemeToggle, themeToggleVariants };
