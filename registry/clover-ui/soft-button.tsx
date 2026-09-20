// soft-button.tsx
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
}

const colorMap: Record<SoftColor, string> = {
  red: [
    "bg-[radial-gradient(ellipse_at_center,#ff1515_0%,#ff1b1b_35%,#ff4b4b_68%,#ff7777_100%)]",
    "text-black",
  ].join(" "),

  darkRed: [
    "bg-[radial-gradient(ellipse_at_center,#ff1717_0%,#f00000_38%,#b90000_72%,#9f0000_100%)]",
    "text-black",
  ].join(" "),

  green: [
    "bg-[radial-gradient(ellipse_at_center,#4a9500_0%,#579f0b_35%,#86b744_68%,#a9c978_100%)]",
    "text-white",
  ].join(" "),

  lime: [
    "bg-[radial-gradient(ellipse_at_center,#7dff00_0%,#73ed00_38%,#58b900_70%,#4b9700_100%)]",
    "text-black",
  ].join(" "),

  blue: [
    "bg-[radial-gradient(ellipse_at_center,#1e9bff_0%,#0f8cf5_35%,#1a6fd1_68%,#2a56a8_100%)]",
    "text-white",
  ].join(" "),

  purple: [
    "bg-[radial-gradient(ellipse_at_center,#b15aff_0%,#a33ff5_35%,#8226cc_68%,#631d9f_100%)]",
    "text-white",
  ].join(" "),

  orange: [
    "bg-[radial-gradient(ellipse_at_center,#ff9d15_0%,#ff8c1b_35%,#f5701f_68%,#d9591a_100%)]",
    "text-black",
  ].join(" "),

  yellow: [
    "bg-[radial-gradient(ellipse_at_center,#fff015_0%,#ffe01b_35%,#f5c31f_68%,#d9a11a_100%)]",
    "text-black",
  ].join(" "),

  pink: [
    "bg-[radial-gradient(ellipse_at_center,#ff5ec4_0%,#ff3fb3_35%,#e0269a_68%,#b81d7c_100%)]",
    "text-black",
  ].join(" "),

  cyan: [
    "bg-[radial-gradient(ellipse_at_center,#15f0ff_0%,#1be0ed_35%,#1fb7c3_68%,#1a949e_100%)]",
    "text-black",
  ].join(" "),
};

const sizeMap: Record<SizeVariant, string> = {
  sm: "h-9 px-5 text-sm",
  default: "h-12 px-8 text-base",
  lg: "h-16 px-12 text-xl",
};

const SoftButton = React.forwardRef<HTMLButtonElement, SoftButtonProps>(
  ({ children, color = "red", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={[
          "group relative inline-flex cursor-pointer items-center justify-center",
          "gap-2 overflow-hidden whitespace-nowrap rounded-full",
          "font-semibold",
          "transition-[filter,transform,box-shadow] duration-200",
          "active:translate-y-0 active:scale-[0.98] active:brightness-95",
          "disabled:pointer-events-none disabled:opacity-50",
          "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
          colorMap[color],
          sizeMap[size],
        ].join(" ")}
        {...props}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-[1px] rounded-[inherit] shadow-[inset_0_1px_2px_rgba(255,255,255,0.35),inset_0_-2px_3px_rgba(0,0,0,0.12)]"
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