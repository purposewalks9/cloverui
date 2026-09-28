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

const colorMap: Record<SoftColor, { background: string; foreground: string }> = {
  red: { background: "#ff3b3b", foreground: "#fff" },
  darkRed: { background: "#df1f1f", foreground: "#fff" },
  green: { background: "#63a928", foreground: "#fff" },
  lime: { background: "#b8ed20", foreground: "#101500" },
  blue: { background: "#278ff0", foreground: "#fff" },
  purple: { background: "#8b5cf6", foreground: "#fff" },
  orange: { background: "#ff922e", foreground: "#241100" },
  yellow: { background: "#ffdc32", foreground: "#241b00" },
  pink: { background: "#f04fbd", foreground: "#fff" },
  cyan: { background: "#28dce7", foreground: "#062022" },
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
          "border border-black/10 shadow-sm",
          "transition-colors duration-150",
          "active:brightness-95",
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
          ["--soft-focus" as string]: palette.background,
        }}
        {...props}
      >
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
