"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";

import { cn } from "@/lib/utils";

const bubbleVariants = cva(
  "relative flex flex-col items-center text-sm font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        solid:
          "[--tip-bg:var(--foreground)] [--tip-chip:24%] [--tip-fg:var(--background)] dark:[--tip-chip:9%]",
        surface:
          "[--tip-bg:var(--popover)] [--tip-chip:9%] [--tip-fg:var(--popover-foreground)] dark:[--tip-chip:24%]",
      },
      side: {
        top: "",
        bottom: "flex-col-reverse",
      },
    },
    defaultVariants: { variant: "solid", side: "top" },
  },
);

export type RichTooltipVariant = NonNullable<VariantProps<typeof bubbleVariants>["variant"]>;
export type RichTooltipSide = NonNullable<VariantProps<typeof bubbleVariants>["side"]>;

export interface RichTooltipProps
  extends Omit<React.ComponentProps<"span">, "color">, VariantProps<typeof bubbleVariants> {
  label: React.ReactNode;
  route?: string[];
  badge?: React.ReactNode;
  color?: string;
  textColor?: string;
  open?: boolean;
  delay?: number;
  contentClassName?: string;
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 3 },
  show: { opacity: 1, y: 0, transition: { duration: 0.12, ease: [0.22, 1, 0.36, 1] } },
};

const staticItemVariants: Variants = {
  hidden: { opacity: 1 },
  show: { opacity: 1 },
};

function RichTooltip({
  label,
  route,
  badge,
  color,
  textColor = "#ffffff",
  variant = "solid",
  side = "top",
  open,
  delay = 0,
  className,
  contentClassName,
  children,
  onPointerEnter,
  onPointerLeave,
  onPointerDown,
  onFocus,
  onBlur,
  onKeyDown,
  ...props
}: RichTooltipProps) {
  const reduceMotion = useReducedMotion();
  const id = React.useId();
  const rootRef = React.useRef<HTMLSpanElement>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [active, setActive] = React.useState(false);
  const [touched, setTouched] = React.useState(false);
  const visible = open ?? active;
  const top = side === "top";
  const hasRoute = Boolean(route && route.length > 0);
  const hasBadge = badge != null && badge !== "";
  const hasExtras = hasRoute || hasBadge;

  const clear = React.useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const show = React.useCallback(
    (wait: number) => {
      clear();
      if (wait <= 0) setActive(true);
      else timer.current = setTimeout(() => setActive(true), wait);
    },
    [clear],
  );

  const hide = React.useCallback(() => {
    clear();
    setActive(false);
    setTouched(false);
  }, [clear]);

  React.useEffect(() => clear, [clear]);

  React.useEffect(() => {
    if (!touched) return;
    const onDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) hide();
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [touched, hide]);

  const bubble: Variants = reduceMotion
    ? {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.08 } },
        exit: { opacity: 0, transition: { duration: 0.06 } },
      }
    : {
        hidden: { opacity: 0, y: top ? 4 : -4, scale: 0.94 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            type: "spring",
            duration: 0.2,
            bounce: 0.2,
            opacity: { duration: 0.08 },
            staggerChildren: 0.02,
          },
        },
        exit: {
          opacity: 0,
          y: top ? 2 : -2,
          scale: 0.97,
          transition: { duration: 0.08, ease: "easeIn" },
        },
      };

  const item = reduceMotion ? staticItemVariants : itemVariants;

  const trigger = React.isValidElement<{ "aria-describedby"?: string }>(children)
    ? React.cloneElement(children, { "aria-describedby": visible ? id : undefined })
    : children;

  return (
    <span
      ref={rootRef}
      className={cn("relative inline-flex", className)}
      {...props}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (event.pointerType !== "touch") show(delay);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        if (event.pointerType !== "touch") hide();
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (event.pointerType !== "touch") return;
        if (touched) hide();
        else {
          setTouched(true);
          show(0);
        }
      }}
      onFocus={(event) => {
        onFocus?.(event);
        show(0);
      }}
      onBlur={(event) => {
        onBlur?.(event);
        if (!event.currentTarget.contains(event.relatedTarget as Node)) hide();
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.key === "Escape") hide();
      }}
    >
      {trigger}

      <AnimatePresence>
        {visible && (
          <span
            className={cn(
              "pointer-events-none absolute left-1/2 z-50 w-max -translate-x-1/2",
              top ? "bottom-full mb-1.5" : "top-full mt-1.5",
            )}
          >
            <motion.span
              id={id}
              role="tooltip"
              variants={bubble}
              initial="hidden"
              animate="show"
              exit="exit"
              style={{
                transformOrigin: top ? "50% 100%" : "50% 0%",
                ...(color
                  ? ({
                      "--tip-bg": color,
                      "--tip-fg": textColor,
                      "--tip-chip": "24%",
                    } as React.CSSProperties)
                  : null),
              }}
              className={cn(
                bubbleVariants({ variant, side }),
                "[filter:drop-shadow(0_0_0.5px_rgb(0_0_0/0.2))_drop-shadow(0_2px_3px_rgb(0_0_0/0.06))_drop-shadow(0_10px_18px_rgb(0_0_0/0.1))]",
                "dark:[filter:drop-shadow(0_0_0.5px_rgb(255_255_255/0.22))_drop-shadow(0_10px_18px_rgb(0_0_0/0.5))]",
                contentClassName,
              )}
            >
              <span
                className={cn(
                  "flex items-center gap-[0.55em] rounded-[0.85em] bg-(--tip-bg) bg-linear-to-b from-white/[0.07] to-transparent py-[0.42em] pl-[0.9em] text-(--tip-fg) shadow-[inset_0_1px_0_rgb(255_255_255/0.12)]",
                  hasExtras ? "pr-[0.45em]" : "pr-[0.9em]",
                )}
              >
                <motion.span variants={item} className="shrink-0 py-[0.1em]">
                  {label}
                </motion.span>

                {hasRoute && (
                  <motion.span variants={item} className="flex shrink-0 items-center gap-[0.3em]">
                    {route?.map((stop, index) => (
                      <React.Fragment key={`${stop}-${index}`}>
                        {index > 0 && (
                          <svg
                            aria-hidden
                            viewBox="0 0 24 24"
                            className="size-[0.95em] shrink-0 fill-none stroke-current stroke-[2.6] opacity-70"
                          >
                            <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                        <span className="rounded-[0.45em] bg-[color-mix(in_oklab,var(--tip-fg)_var(--tip-chip),transparent)] px-[0.45em] py-[0.1em] font-semibold">
                          {stop}
                        </span>
                      </React.Fragment>
                    ))}
                  </motion.span>
                )}

                {hasBadge && (
                  <motion.span
                    variants={item}
                    className="shrink-0 rounded-[0.45em] bg-(--tip-fg) px-[0.45em] py-[0.1em] font-semibold text-(--tip-bg) tabular-nums"
                  >
                    {badge}
                  </motion.span>
                )}
              </span>

              <svg
                aria-hidden
                viewBox="0 0 16 7"
                className={cn(
                  "h-[0.45em] w-[1.05em] shrink-0 fill-(--tip-bg)",
                  top ? "-mt-px" : "-mb-px rotate-180",
                )}
              >
                <path d="M0 0C4.2 0 5.6 7 8 7S11.8 0 16 0Z" />
              </svg>
            </motion.span>
          </span>
        )}
      </AnimatePresence>
    </span>
  );
}

export { RichTooltip };
