"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

const themeToggleVariants = cva(
  [
    "group relative inline-flex size-[2.8em] shrink-0 cursor-pointer rounded-full p-[0.2em] outline-none select-none",
    "transition-[scale] duration-500 ease-[cubic-bezier(0.22,1.2,0.36,1)] active:scale-[0.95] active:duration-200 active:ease-out motion-reduce:active:scale-100",
    "shadow-[0_0.2em_0.5em_rgb(0_0_0/0.35),0_0.05em_0.1em_rgb(0_0_0/0.4)]",
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
  sunColor?: string;
  moonColor?: string;
  pageFade?: boolean;
}

type Ripple = { id: number; x: number; y: number; size: number };

const subscribe = () => () => {};

const EASE = [0.22, 1, 0.36, 1] as const;

const RIM_MASK = {
  mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
  WebkitMask: "linear-gradient(#000 0 0) content-box xor, linear-gradient(#000 0 0)",
} satisfies React.CSSProperties;

const SKINS = {
  dark: {
    rim: "linear-gradient(180deg, #343434, #050505)",
    face: "radial-gradient(circle at 38% 30%, #474747 0%, #1b1b1b 45%, #070707 80%)",
    shine:
      "inset 0 0.07em 0.06em rgb(255 255 255 / 0.18), inset 0 -0.1em 0.2em rgb(0 0 0 / 0.6), 0 0.06em 0.12em rgb(0 0 0 / 0.5)",
  },
  light: {
    rim: "linear-gradient(180deg, #ffffff, #c9c9cf)",
    face: "radial-gradient(circle at 38% 30%, #ffffff 0%, #f1f1f4 45%, #d6d6dc 85%)",
    shine:
      "inset 0 0.07em 0.06em rgb(255 255 255 / 0.9), inset 0 -0.1em 0.2em rgb(0 0 0 / 0.12), 0 0.06em 0.12em rgb(0 0 0 / 0.25)",
  },
};

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

function Skin({
  skin,
  shown,
  ready,
  fallback,
}: {
  skin: (typeof SKINS)["dark"];
  shown: boolean;
  ready: boolean;
  fallback: string;
}) {
  return (
    <motion.span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 rounded-full p-[0.2em]",
        !ready && fallback,
      )}
      style={{ background: skin.rim }}
      initial={false}
      animate={ready ? { opacity: shown ? 1 : 0 } : undefined}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <span
        className="block size-full rounded-full"
        style={{ background: skin.face, boxShadow: skin.shine }}
      />
    </motion.span>
  );
}

function ThemeToggle({
  theme,
  onThemeChange,
  sunColor = "#f5b81c",
  moonColor = "#3b3d4a",
  pageFade = true,
  size = "default",
  className,
  style,
  disabled,
  onPointerMove,
  onPointerDown,
  ...props
}: ThemeToggleProps) {
  const reduceMotion = useReducedMotion();
  const faceRef = React.useRef<HTMLSpanElement>(null);
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
  const glow = dark ? "rgb(0 0 0 / 0.07)" : "rgb(255 255 255 / 0.16)";

  const icon = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scale: 0.6, rotate: -70 },
        animate: { opacity: 1, scale: 1, rotate: 0 },
        exit: { opacity: 0, scale: 0.6, rotate: 70 },
      };

  const track = (target: HTMLButtonElement, clientX: number, clientY: number) => {
    const rect = target.getBoundingClientRect();
    target.style.setProperty("--tt-x", `${clientX - rect.left}px`);
    target.style.setProperty("--tt-y", `${clientY - rect.top}px`);
  };

  const ripple = (clientX?: number, clientY?: number) => {
    const area = faceRef.current;
    if (!area || reduceMotion) return;
    const rect = area.getBoundingClientRect();
    const x = clientX === undefined ? rect.width / 2 : clientX - rect.left;
    const y = clientY === undefined ? rect.height / 2 : clientY - rect.top;
    const size = 2.4 * Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y));
    const id = ++rippleId.current;
    setRipples((items) => [...items, { id, x, y, size }]);
  };

  const apply = (next: ThemeToggleTheme) => {
    if (theme === undefined) {
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(next);
      root.style.colorScheme = next;
      setTheme(next);
    }
    onThemeChange?.(next);
  };

  const flip = () => {
    const next: ThemeToggleTheme = dark ? "light" : "dark";
    if (!pageFade || reduceMotion || typeof document.startViewTransition !== "function") {
      apply(next);
      return;
    }
    const transition = document.startViewTransition(() => flushSync(() => apply(next)));
    transition.ready
      .then(() => {
        const timing = { duration: 450, easing: "cubic-bezier(0.4, 0, 0.2, 1)" };
        document.documentElement.animate(
          { opacity: [1, 0] },
          { ...timing, pseudoElement: "::view-transition-old(root)" },
        );
        document.documentElement.animate(
          { opacity: [0, 1] },
          { ...timing, pseudoElement: "::view-transition-new(root)" },
        );
      })
      .catch(() => {});
  };

  return (
    <button
      type="button"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
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
        flip();
      }}
      {...props}
    >
      <Skin
        key={ready ? "dark-ready" : "dark-pending"}
        skin={SKINS.dark}
        shown={!dark}
        ready={ready}
        fallback="dark:opacity-0"
      />
      <Skin
        key={ready ? "light-ready" : "light-pending"}
        skin={SKINS.light}
        shown={dark}
        ready={ready}
        fallback="opacity-0 dark:opacity-100"
      />

      <span ref={faceRef} className="relative block size-full overflow-hidden rounded-full">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(2.4em circle at calc(var(--tt-x) - 0.2em) calc(var(--tt-y) - 0.2em), ${glow}, transparent 70%)`,
          }}
        />

        {ripples.map((item) => (
          <motion.span
            key={item.id}
            aria-hidden
            className="pointer-events-none absolute rounded-full"
            style={{
              left: item.x - item.size / 2,
              top: item.y - item.size / 2,
              width: item.size,
              height: item.size,
              background: `radial-gradient(circle, ${dark ? "rgb(0 0 0 / 0.12)" : "rgb(255 255 255 / 0.22)"} 0%, transparent 65%)`,
            }}
            initial={{ scale: 0.15, opacity: 1 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{
              scale: { duration: 0.9, ease: EASE },
              opacity: { duration: 0.9, ease: "easeOut" },
            }}
            onAnimationComplete={() =>
              setRipples((items) => items.filter(({ id }) => id !== item.id))
            }
          />
        ))}

        <span aria-hidden className="absolute inset-0 grid place-items-center">
          {ready ? (
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={dark ? "moon" : "sun"}
                className="col-start-1 row-start-1 size-[1.2em]"
                style={{ color: dark ? moonColor : sunColor }}
                {...icon}
                transition={{ duration: reduceMotion ? 0.2 : 0.55, ease: EASE }}
              >
                {dark ? <Moon /> : <Sun />}
              </motion.span>
            </AnimatePresence>
          ) : (
            <>
              <span
                className="col-start-1 row-start-1 size-[1.2em] dark:hidden"
                style={{ color: sunColor }}
              >
                <Sun />
              </span>
              <span
                className="col-start-1 row-start-1 hidden size-[1.2em] dark:block"
                style={{ color: moonColor }}
              >
                <Moon />
              </span>
            </>
          )}
        </span>
      </span>

      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full p-[0.2em] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          ...RIM_MASK,
          background: `radial-gradient(2.2em circle at var(--tt-x) var(--tt-y), ${dark ? "rgb(255 255 255 / 0.9)" : "rgb(255 255 255 / 0.5)"}, transparent 75%)`,
        }}
      />
    </button>
  );
}

export { ThemeToggle, themeToggleVariants };
