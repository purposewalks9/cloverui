import * as React from "react";

import { cn } from "@/lib/utils";

export type RichTextColor =
  | "default"
  | "blue"
  | "purple"
  | "pink"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "teal"
  | "cyan"
  | "indigo"
  | "violet"
  | "rose"
  | "amber"
  | "lime"
  | "sky"
  | "slate"
  | "gray"
  | "zinc"
  | "neutral"
  | "stone"
  | "fuchsia"
  | "emerald";

export interface RichTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  color?: RichTextColor;
}

const colorMap: Record<RichTextColor, string> = {
  default: "from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-400",
  emerald: "from-emerald-500 to-emerald-700 dark:from-emerald-300 dark:to-emerald-500",
  blue: "from-blue-500 to-blue-700 dark:from-blue-300 dark:to-blue-500",
  purple: "from-purple-500 to-purple-700 dark:from-purple-300 dark:to-purple-500",
  pink: "from-pink-500 to-pink-700 dark:from-pink-300 dark:to-pink-500",
  red: "from-red-500 to-red-700 dark:from-red-300 dark:to-red-500",
  orange: "from-orange-500 to-orange-700 dark:from-orange-300 dark:to-orange-500",
  yellow: "from-yellow-500 to-yellow-700 dark:from-yellow-300 dark:to-yellow-500",
  green: "from-green-500 to-green-700 dark:from-green-300 dark:to-green-500",
  teal: "from-teal-500 to-teal-700 dark:from-teal-300 dark:to-teal-500",
  cyan: "from-cyan-500 to-cyan-700 dark:from-cyan-300 dark:to-cyan-500",
  indigo: "from-indigo-500 to-indigo-700 dark:from-indigo-300 dark:to-indigo-500",
  violet: "from-violet-500 to-violet-700 dark:from-violet-300 dark:to-violet-500",
  rose: "from-rose-500 to-rose-700 dark:from-rose-300 dark:to-rose-500",
  amber: "from-amber-500 to-amber-700 dark:from-amber-300 dark:to-amber-500",
  lime: "from-lime-500 to-lime-700 dark:from-lime-300 dark:to-lime-500",
  sky: "from-sky-500 to-sky-700 dark:from-sky-300 dark:to-sky-500",
  slate: "from-slate-500 to-slate-700 dark:from-slate-300 dark:to-slate-500",
  gray: "from-gray-500 to-gray-700 dark:from-gray-300 dark:to-gray-500",
  zinc: "from-zinc-500 to-zinc-700 dark:from-zinc-300 dark:to-zinc-500",
  neutral: "from-neutral-500 to-neutral-700 dark:from-neutral-300 dark:to-neutral-500",
  stone: "from-stone-500 to-stone-700 dark:from-stone-300 dark:to-stone-500",
  fuchsia: "from-fuchsia-500 to-fuchsia-700 dark:from-fuchsia-300 dark:to-fuchsia-500",
};

const textShadowMap: Record<RichTextColor, string> = {
  default: "[text-shadow:0_1px_0_rgb(255,255,255)] dark:[text-shadow:0_1px_0_rgb(0,0,0)]",
  emerald: "[text-shadow:0_1px_0_var(--color-emerald-800)]",
  blue: "[text-shadow:0_1px_0_var(--color-blue-800)]",
  purple: "[text-shadow:0_1px_0_var(--color-purple-800)]",
  pink: "[text-shadow:0_1px_0_var(--color-pink-800)]",
  red: "[text-shadow:0_1px_0_var(--color-red-800)]",
  orange: "[text-shadow:0_1px_0_var(--color-orange-800)]",
  yellow: "[text-shadow:0_1px_0_var(--color-yellow-800)]",
  green: "[text-shadow:0_1px_0_var(--color-green-800)]",
  teal: "[text-shadow:0_1px_0_var(--color-teal-800)]",
  cyan: "[text-shadow:0_1px_0_var(--color-cyan-800)]",
  indigo: "[text-shadow:0_1px_0_var(--color-indigo-800)]",
  violet: "[text-shadow:0_1px_0_var(--color-violet-800)]",
  rose: "[text-shadow:0_1px_0_var(--color-rose-800)]",
  amber: "[text-shadow:0_1px_0_var(--color-amber-800)]",
  lime: "[text-shadow:0_1px_0_var(--color-lime-800)]",
  sky: "[text-shadow:0_1px_0_var(--color-sky-800)]",
  slate: "[text-shadow:0_1px_0_var(--color-slate-800)]",
  gray: "[text-shadow:0_1px_0_var(--color-gray-800)]",
  zinc: "[text-shadow:0_1px_0_var(--color-zinc-800)]",
  neutral: "[text-shadow:0_1px_0_var(--color-neutral-800)]",
  stone: "[text-shadow:0_1px_0_var(--color-stone-800)]",
  fuchsia: "[text-shadow:0_1px_0_var(--color-fuchsia-800)]",
};

function RichText({ children, color = "default", className, ...props }: RichTextProps) {
  return (
    <span
      className={cn(
        "inline-block bg-linear-to-b bg-clip-text font-semibold text-transparent",
        colorMap[color],
        textShadowMap[color],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

RichText.displayName = "RichText";

export { RichText };
