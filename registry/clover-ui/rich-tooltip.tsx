"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const tooltipVariants = cva(
  "relative rounded-md px-2 py-1 text-xs leading-tight font-medium whitespace-nowrap shadow-md",
  {
    variants: {
      variant: {
        solid: "bg-foreground text-background",
        surface: "bg-popover text-popover-foreground border-border border",
      },
    },
    defaultVariants: { variant: "solid" },
  },
);

const arrowVariants = cva("absolute left-1/2 size-1.5 -translate-x-1/2 rotate-45", {
  variants: {
    variant: {
      solid: "bg-foreground",
      surface: "bg-popover border-border",
    },
    side: {
      top: "-bottom-[3px]",
      bottom: "-top-[3px]",
    },
  },
  compoundVariants: [
    { variant: "surface", side: "top", className: "border-r border-b" },
    { variant: "surface", side: "bottom", className: "border-t border-l" },
  ],
  defaultVariants: { variant: "solid", side: "top" },
});

export type RichTooltipVariant = NonNullable<VariantProps<typeof tooltipVariants>["variant"]>;
export type RichTooltipSide = NonNullable<VariantProps<typeof arrowVariants>["side"]>;

export interface RichTooltipProps extends Omit<React.ComponentProps<"span">, "color"> {
  label: React.ReactNode;
  variant?: RichTooltipVariant;
  side?: RichTooltipSide;
  open?: boolean;
  delay?: number;
  contentClassName?: string;
}

function RichTooltip({
  label,
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
  const offset = reduceMotion ? 0 : top ? 2 : -2;

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
          <motion.span
            id={id}
            role="tooltip"
            initial={{ opacity: 0, y: offset }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.12, ease: "easeOut" } }}
            exit={{ opacity: 0, transition: { duration: 0.08, ease: "easeIn" } }}
            className={cn(
              "pointer-events-none absolute left-1/2 z-50 w-max",
              top ? "bottom-full mb-2" : "top-full mt-2",
            )}
            style={{ x: "-50%" }}
          >
            <span className={cn(tooltipVariants({ variant }), "block", contentClassName)}>
              {label}
              <span aria-hidden className={arrowVariants({ variant, side })} />
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

export { RichTooltip };
