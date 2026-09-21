import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";

type SoftColor =
  | "red"
  | "darkRed"
  | "green"
  | "lime"
  | "blue"
  | "purple"
  | "orange"
  | "yellow"
  | "pink"
  | "cyan";

type SizeVariant = "sm" | "default" | "lg";

interface SoftButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  children: React.ReactNode;
  color?: SoftColor;
  size?: SizeVariant;
  asChild?: boolean;
  className?: string;
}

const colorMap: Record<SoftColor, { background: string; foreground: string; glow: string }> = {
  red: {
    background: "radial-gradient(120% 140% at 50% 0%, #ff6b6b 0%, #ff2d2d 42%, #c91515 100%)",
    foreground: "#fff",
    glow: "rgba(255, 45, 45, .34)",
  },
  darkRed: {
    background: "radial-gradient(120% 140% at 50% 0%, #ff4545 0%, #e31212 42%, #850808 100%)",
    foreground: "#fff",
    glow: "rgba(227, 18, 18, .34)",
  },
  green: {
    background: "radial-gradient(120% 140% at 50% 0%, #a8d96a 0%, #63a928 42%, #347012 100%)",
    foreground: "#fff",
    glow: "rgba(99, 169, 40, .28)",
  },
  lime: {
    background: "radial-gradient(120% 140% at 50% 0%, #efff78 0%, #b8ed20 40%, #63ae00 100%)",
    foreground: "#101500",
    glow: "rgba(184, 237, 32, .32)",
  },
  blue: {
    background: "radial-gradient(120% 140% at 50% 0%, #72c7ff 0%, #278ff0 42%, #1554aa 100%)",
    foreground: "#fff",
    glow: "rgba(39, 143, 240, .3)",
  },
  purple: {
    background: "radial-gradient(120% 140% at 50% 0%, #d08cff 0%, #9c4cff 42%, #5a229e 100%)",
    foreground: "#fff",
    glow: "rgba(156, 76, 255, .3)",
  },
  orange: {
    background: "radial-gradient(120% 140% at 50% 0%, #ffd080 0%, #ff922e 42%, #c95008 100%)",
    foreground: "#241100",
    glow: "rgba(255, 146, 46, .3)",
  },
  yellow: {
    background: "radial-gradient(120% 140% at 50% 0%, #fff99a 0%, #ffdc32 42%, #c89100 100%)",
    foreground: "#241b00",
    glow: "rgba(255, 220, 50, .28)",
  },
  pink: {
    background: "radial-gradient(120% 140% at 50% 0%, #ff9bdf 0%, #f04fbd 42%, #a81778 100%)",
    foreground: "#fff",
    glow: "rgba(240, 79, 189, .3)",
  },
  cyan: {
    background: "radial-gradient(120% 140% at 50% 0%, #9dffff 0%, #28dce7 42%, #14828c 100%)",
    foreground: "#062022",
    glow: "rgba(40, 220, 231, .3)",
  },
};

const sizeMap: Record<SizeVariant, string> = {
  sm: "h-9 px-5 text-sm",
  default: "h-12 px-8 text-base",
  lg: "h-16 px-12 text-xl",
};

const SoftButton = React.forwardRef<HTMLButtonElement, SoftButtonProps>(
  ({ children, color = "red", size = "default", asChild = false, className, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const palette = colorMap[color];

    return (
      <Comp
        ref={ref}
        className={[
          "group relative inline-flex cursor-pointer items-center justify-center",
          "gap-2 overflow-hidden whitespace-nowrap rounded-full font-semibold",
          "transition-[filter,transform,box-shadow] duration-300 ease-out",
          "active:translate-y-0 active:scale-[0.98] active:brightness-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--soft-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:pointer-events-none disabled:opacity-50",
          "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
          sizeMap[size],
          className,
        ].join(" ")}
        style={{
          ...style,
          background: palette.background,
          color: palette.foreground,
          ["--soft-glow" as string]: palette.glow,
          ["--soft-focus" as string]: palette.glow,
        }}
        {...props}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-[1px] rounded-[inherit] bg-[linear-gradient(180deg,rgba(255,255,255,.28),transparent_42%)] opacity-80 transition-opacity duration-300 group-hover:opacity-100"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-x-1/3 top-0 h-px bg-white/70 blur-sm transition-transform duration-500 group-hover:translate-x-1/3"
        />
        {asChild ? (
          <Slottable>{children}</Slottable>
        ) : (
          <span className="relative flex items-center gap-2">{children}</span>
        )}
      </Comp>
    );
  },
);

SoftButton.displayName = "SoftButton";

export { SoftButton };
export type { SoftColor };
