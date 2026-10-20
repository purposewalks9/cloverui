"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const sculptedButtonVariants = cva(
  [
    "group/sculpted relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 align-middle font-semibold whitespace-nowrap outline-none select-none touch-manipulation [-webkit-tap-highlight-color:transparent]",
    "[--sculpted-lift:0.24em] enabled:active:[--sculpted-lift:0.02em] data-[key-pressed=true]:[--sculpted-lift:0.02em]",
    "focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-4",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ],
  {
    variants: {
      size: {
        sm: "text-sm",
        default: "text-base",
        lg: "text-xl",
      },
      shape: {
        pill: "min-h-[3.5em] min-w-[8em]",
        circle: "size-[3.5em]",
      },
    },
    defaultVariants: { size: "default", shape: "pill" },
  },
);

export type SculptedButtonSize = NonNullable<VariantProps<typeof sculptedButtonVariants>["size"]>;
export type SculptedButtonShape = NonNullable<VariantProps<typeof sculptedButtonVariants>["shape"]>;

export interface SculptedButtonProps
  extends React.ComponentProps<"button">, VariantProps<typeof sculptedButtonVariants> {}

function SculptedButton({
  children,
  size = "default",
  shape = "pill",
  className,
  style,
  disabled,
  type = "button",
  onKeyDown,
  onKeyUp,
  onBlur,
  ...props
}: SculptedButtonProps) {
  const [keyPressed, setKeyPressed] = React.useState(false);
  const reducedMotion = useReducedMotion();

  React.useEffect(() => {
    if (!keyPressed) return;
    const release = () => setKeyPressed(false);
    window.addEventListener("keyup", release);
    window.addEventListener("blur", release);
    return () => {
      window.removeEventListener("keyup", release);
      window.removeEventListener("blur", release);
    };
  }, [keyPressed]);

  return (
    <button
      {...props}
      type={type}
      disabled={disabled}
      data-key-pressed={keyPressed && !disabled}
      className={cn(sculptedButtonVariants({ size, shape }), className)}
      style={{
        color: "#48484b",
        ...style,
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented && (event.key === " " || event.key === "Enter")) {
          setKeyPressed(true);
        }
      }}
      onKeyUp={(event) => {
        onKeyUp?.(event);
        if (event.key === " " || event.key === "Enter") setKeyPressed(false);
      }}
      onBlur={(event) => {
        onBlur?.(event);
        setKeyPressed(false);
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          background: "linear-gradient(180deg, #d5d5d7 0%, #b9b9bc 100%)",
          boxShadow: "0 0.07em 0 #a6a6aa, 0 0.3em 0.45em -0.15em rgb(0 0 0 / 0.22)",
        }}
      />
      <span
        className={cn(
          "pointer-events-none relative inline-flex min-h-[inherit] w-full -translate-y-(--sculpted-lift) items-center justify-center rounded-[inherit] p-[0.3em]",
          "transition-[transform,box-shadow] duration-150 ease-out group-active/sculpted:duration-0 group-data-[key-pressed=true]/sculpted:duration-0 motion-reduce:transition-none",
        )}
        style={{
          transitionDuration: reducedMotion ? "0s" : undefined,
          background: "linear-gradient(180deg, #ffffff 0%, #fafafa 38%, #eeeeef 100%)",
          boxShadow:
            "inset 0 0.06em 0.05em #fff, inset 0 -0.04em 0.05em rgb(0 0 0 / 0.05), 0 calc(var(--sculpted-lift) * 1.3) calc(0.1em + var(--sculpted-lift) * 1.5) rgb(0 0 0 / 0.16)",
        }}
      >
        <span
          className={cn(
            "inline-flex min-h-[2.9em] w-full items-center justify-center gap-[0.5em] rounded-full [&_svg]:size-[1.1em] [&_svg]:shrink-0",
            shape === "circle" ? "aspect-square" : "px-[1.4em] py-[0.6em]",
          )}
          style={{
            background:
              "linear-gradient(180deg, #dedee0 0%, #ededee 42%, #fafafa 83%, #ffffff 100%)",
            boxShadow: "inset 0 0.06em 0.1em rgb(0 0 0 / 0.07), 0 0.05em 0 rgb(255 255 255 / 0.95)",
            textShadow: "0 1px 0 rgb(255 255 255 / 0.8)",
          }}
        >
          {children}
        </span>
      </span>
    </button>
  );
}

export { SculptedButton, sculptedButtonVariants };
