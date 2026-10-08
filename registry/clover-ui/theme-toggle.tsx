"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

const themeToggleVariants = cva(
  [
    "relative inline-flex size-[2.8em] shrink-0 cursor-pointer rounded-full outline-none select-none [-webkit-tap-highlight-color:transparent]",
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
}

const subscribe = () => () => {};

const LIFT = {
  up: 0.24,
  latched: 0.1,
  pressed: 0.02,
};

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

function ThemeToggle({
  theme,
  onThemeChange,
  sunColor = "#f5b81c",
  moonColor = "#3b3d4a",
  size = "default",
  className,
  style,
  disabled,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
  onKeyDown,
  onKeyUp,
  onBlur,
  ...props
}: ThemeToggleProps) {
  const [pressing, setPressing] = React.useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const current = theme ?? (mounted ? resolvedTheme : undefined);
  const dark = current === "dark";
  const ready = mounted && current !== undefined;

  const lift = pressing ? LIFT.pressed : dark ? LIFT.latched : LIFT.up;

  const skin = (name: keyof typeof SKINS) => {
    if (!ready) return name === "dark" ? "dark:hidden" : "hidden dark:block";
    return (name === "dark") === dark ? "hidden" : "";
  };

  return (
    <button
      type="button"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      disabled={disabled}
      className={cn(
        themeToggleVariants({ size }),
        !ready && "[--lift:0.24em] dark:[--lift:0.1em]",
        className,
      )}
      style={
        {
          ...(ready ? { "--lift": `${lift}em` } : null),
          ...style,
        } as React.CSSProperties
      }
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        setPressing(false);
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (event.button === 0) setPressing(true);
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
      onClick={() => {
        const next: ThemeToggleTheme = dark ? "light" : "dark";
        if (theme === undefined) setTheme(next);
        onThemeChange?.(next);
      }}
      {...props}
    >
      {(["dark", "light"] as const).map((name) => (
        <span
          key={name}
          aria-hidden
          className={cn("pointer-events-none absolute inset-0 rounded-full p-[0.2em]", skin(name))}
          style={{ background: SKINS[name].rim }}
        >
          <span
            className="block size-full rounded-full shadow-[inset_0_0.1em_0.2em_rgb(0_0_0/0.45)]"
            style={{ background: SKINS[name].well }}
          />
        </span>
      ))}

      <span aria-hidden className="pointer-events-none absolute inset-[0.3em]">
        {(["dark", "light"] as const).map((name) => (
          <span
            key={name}
            className={cn(
              "absolute inset-x-0 bottom-0 h-[calc(100%+var(--lift))] rounded-full shadow-[0_calc(0.03em+var(--lift)*0.3)_calc(0.06em+var(--lift)*0.6)_rgb(0_0_0/0.4)]",
              skin(name),
            )}
            style={{ background: SKINS[name].wall }}
          />
        ))}

        <span className="absolute inset-0 -translate-y-(--lift) overflow-hidden rounded-full">
          {(["dark", "light"] as const).map((name) => (
            <span
              key={name}
              className={cn("absolute inset-0 rounded-full", skin(name))}
              style={{ background: SKINS[name].face, boxShadow: SKINS[name].shine }}
            />
          ))}

          <span className="absolute inset-0 grid place-items-center">
            <span
              className={cn("col-start-1 row-start-1 size-[1.1em]", skin("dark"))}
              style={{ color: sunColor }}
            >
              <Sun />
            </span>
            <span
              className={cn("col-start-1 row-start-1 size-[1.1em]", skin("light"))}
              style={{ color: moonColor }}
            >
              <Moon />
            </span>
          </span>
        </span>
      </span>
    </button>
  );
}

export { ThemeToggle, themeToggleVariants };
