"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, motion, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

const themeToggleVariants = cva(
  [
    "group relative inline-flex size-[2.8em] shrink-0 cursor-pointer rounded-full outline-none select-none [-webkit-tap-highlight-color:transparent]",
    "shadow-[0_0.2em_0.5em_rgb(0_0_0/0.3),0_0.05em_0.1em_rgb(0_0_0/0.35)]",
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

const LIFT = {
  up: 0.24,
  upHover: 0.19,
  latched: 0.1,
  latchedHover: 0.08,
  pressed: 0.02,
};

const SPRING = { stiffness: 520, damping: 30, mass: 0.6 };

const RIM_MASK = {
  mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
  WebkitMask: "linear-gradient(#000 0 0) content-box xor, linear-gradient(#000 0 0)",
} satisfies React.CSSProperties;

const SKINS = {
  dark: {
    rim: "linear-gradient(180deg, #343434, #050505)",
    well: "linear-gradient(180deg, #000000, #101010)",
    wall: "linear-gradient(180deg, #262626, #0a0a0a)",
    face: "radial-gradient(circle at 38% 30%, #474747 0%, #1b1b1b 45%, #070707 80%)",
    shine: "inset 0 0.07em 0.06em rgb(255 255 255 / 0.18), inset 0 -0.1em 0.2em rgb(0 0 0 / 0.6)",
  },
  light: {
    rim: "linear-gradient(180deg, #ffffff, #c9c9cf)",
    well: "linear-gradient(180deg, #a9a9b3, #c4c4cc)",
    wall: "linear-gradient(180deg, #d4d4da, #a2a2ad)",
    face: "radial-gradient(circle at 38% 30%, #ffffff 0%, #f1f1f4 45%, #d6d6dc 85%)",
    shine: "inset 0 0.07em 0.06em rgb(255 255 255 / 0.9), inset 0 -0.1em 0.2em rgb(0 0 0 / 0.12)",
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

function Fade({
  shown,
  ready,
  fallback,
  className,
  style,
  children,
}: {
  shown: boolean;
  ready: boolean;
  fallback: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  return (
    <motion.span
      key={ready ? "ready" : "pending"}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 rounded-full",
        !ready && fallback,
        className,
      )}
      style={style}
      initial={false}
      animate={ready ? { opacity: shown ? 1 : 0 } : undefined}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {children}
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
  onPointerUp,
  onPointerEnter,
  onPointerLeave,
  onPointerCancel,
  onKeyDown,
  onKeyUp,
  onBlur,
  ...props
}: ThemeToggleProps) {
  const reduceMotion = useReducedMotion();
  const capRef = React.useRef<HTMLSpanElement>(null);
  const rippleId = React.useRef(0);
  const settled = React.useRef(false);
  const [ripples, setRipples] = React.useState<Ripple[]>([]);
  const [pressing, setPressing] = React.useState(false);
  const [hovering, setHovering] = React.useState(false);
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

  const target = pressing
    ? LIFT.pressed
    : dark
      ? hovering
        ? LIFT.latchedHover
        : LIFT.latched
      : hovering
        ? LIFT.upHover
        : LIFT.up;
  const lift = useSpring(LIFT.up, SPRING);

  React.useEffect(() => {
    if (!ready) return;
    if (reduceMotion || !settled.current) lift.jump(target);
    else lift.set(target);
    settled.current = true;
  }, [lift, target, ready, reduceMotion]);

  const capY = useTransform(lift, (value) => `${-value}em`);
  const wallHeight = useTransform(lift, (value) => `calc(100% + ${value}em)`);
  const castShadow = useTransform(
    lift,
    (value) =>
      `0 ${(0.03 + value * 0.3).toFixed(3)}em ${(0.06 + value * 0.6).toFixed(3)}em rgb(0 0 0 / ${(0.3 + value).toFixed(2)})`,
  );

  const icon = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scale: 0.6, rotate: -70 },
        animate: { opacity: 1, scale: 1, rotate: 0 },
        exit: { opacity: 0, scale: 0.6, rotate: 70 },
      };

  const track = (button: HTMLButtonElement, clientX: number, clientY: number) => {
    const rect = button.getBoundingClientRect();
    button.style.setProperty("--tt-x", `${clientX - rect.left}px`);
    button.style.setProperty("--tt-y", `${clientY - rect.top}px`);
  };

  const ripple = (clientX?: number, clientY?: number) => {
    const area = capRef.current;
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
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (event.pointerType === "mouse") setHovering(true);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        setHovering(false);
        setPressing(false);
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (event.button !== 0) return;
        setPressing(true);
        track(event.currentTarget, event.clientX, event.clientY);
        ripple(event.clientX, event.clientY);
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event);
        setPressing(false);
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event);
        setPressing(false);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.key === " " || event.key === "Enter") setPressing(true);
      }}
      onKeyUp={(event) => {
        onKeyUp?.(event);
        setPressing(false);
      }}
      onBlur={(event) => {
        onBlur?.(event);
        setPressing(false);
      }}
      onClick={(event) => {
        if (event.detail === 0) ripple();
        flip();
      }}
      {...props}
    >
      {(["dark", "light"] as const).map((name) => (
        <Fade
          key={name}
          shown={name === "dark" ? !dark : dark}
          ready={ready}
          fallback={name === "dark" ? "dark:opacity-0" : "opacity-0 dark:opacity-100"}
          className="p-[0.2em]"
          style={{ background: SKINS[name].rim }}
        >
          <span
            className="block size-full rounded-full shadow-[inset_0_0.1em_0.2em_rgb(0_0_0/0.45)]"
            style={{ background: SKINS[name].well }}
          />
        </Fade>
      ))}

      <span className="pointer-events-none absolute inset-[0.3em]">
        <motion.span
          aria-hidden
          className="absolute inset-x-0 bottom-0 overflow-hidden rounded-full"
          style={{ height: wallHeight, boxShadow: castShadow }}
        >
          {(["dark", "light"] as const).map((name) => (
            <Fade
              key={name}
              shown={name === "dark" ? !dark : dark}
              ready={ready}
              fallback={name === "dark" ? "dark:opacity-0" : "opacity-0 dark:opacity-100"}
              style={{ background: SKINS[name].wall }}
            />
          ))}
        </motion.span>

        <motion.span
          ref={capRef}
          className="absolute inset-0 overflow-hidden rounded-full will-change-transform"
          style={{ y: capY }}
        >
          {(["dark", "light"] as const).map((name) => (
            <Fade
              key={name}
              shown={name === "dark" ? !dark : dark}
              ready={ready}
              fallback={name === "dark" ? "dark:opacity-0" : "opacity-0 dark:opacity-100"}
              style={{ background: SKINS[name].face, boxShadow: SKINS[name].shine }}
            />
          ))}

          <span
            aria-hidden
            className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: `radial-gradient(2.2em circle at calc(var(--tt-x) - 0.3em) calc(var(--tt-y) - 0.3em), ${glow}, transparent 70%)`,
            }}
          />

          {ripples.map((item) => (
            <motion.span
              key={item.id}
              aria-hidden
              className="absolute rounded-full"
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
                  className="col-start-1 row-start-1 size-[1.1em]"
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
                  className="col-start-1 row-start-1 size-[1.1em] dark:hidden"
                  style={{ color: sunColor }}
                >
                  <Sun />
                </span>
                <span
                  className="col-start-1 row-start-1 hidden size-[1.1em] dark:block"
                  style={{ color: moonColor }}
                >
                  <Moon />
                </span>
              </>
            )}
          </span>
        </motion.span>
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
