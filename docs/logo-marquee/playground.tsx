"use client";

import { LogoMarquee, logoMarqueeLogos } from "@/registry/clover-ui/logo-marquee";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { expr, jsx, type ControlDef } from "@/lib/playground";

const logos = logoMarqueeLogos.map((logo) => ({
  ...logo,
  src: logo.src.replace("https://cloverui.xyz", ""),
}));

const colors: Record<string, string | undefined> = {
  dim: undefined,
  purple: "#8b5cf6",
  blue: "#3b82f6",
  green: "#22c55e",
  orange: "#f97316",
  pink: "#ec4899",
};

const controls: ControlDef[] = [
  {
    type: "select",
    prop: "shimmerColor",
    label: "Shimmer color",
    options: Object.entries(colors).map(([value, swatch]) => ({
      label: value[0].toUpperCase() + value.slice(1),
      value,
      swatch: swatch ?? "#9ca3af",
    })),
  },
  { type: "number", prop: "speed", label: "Speed", min: 0.5, max: 2, step: 0.1 },
  { type: "boolean", prop: "shimmer", label: "Shimmer" },
];

const defaultProps = {
  shimmerColor: "dim",
  speed: 1,
  shimmer: true,
};

export function LogoMarqueePlayground() {
  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={defaultProps}
      code={(values) =>
        jsx("LogoMarquee", {
          logos: expr("logos"),
          speed: values.speed,
          shimmer: values.shimmer ? undefined : false,
          shimmerColor: values.shimmer ? colors[values.shimmerColor as string] : undefined,
          className: "max-w-2xl",
        })
      }
      render={(values) => (
        <div className="flex min-h-[320px] w-full items-center justify-center px-6">
          <LogoMarquee
            key={String(values.speed)}
            logos={logos}
            shimmerColor={colors[values.shimmerColor as string]}
            speed={values.speed as number}
            shimmer={values.shimmer as boolean}
            className="max-w-2xl"
          />
        </div>
      )}
    />
  );
}
