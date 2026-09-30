"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { GrainCube } from "@/registry/clover-ui/grain-cube";
import { NucleusText } from "@/registry/clover-ui/nucleus-text";
import { RichProgress } from "@/registry/clover-ui/rich-progress";
import { GridReveal } from "@/registry/clover-ui/grid-reveal";
import { GaugeText } from "@/registry/clover-ui/gauge-text";
import { SoftButton, type SoftColor } from "@/registry/clover-ui/soft-button";
import { DropText } from "@/registry/clover-ui/drop-text";
import { AppleMusicCard } from "@/registry/clover-ui/apple-music-card";
import { SpotlightText } from "@/registry/clover-ui/spotlight-text";

const TokenFall = dynamic(
  () => import("@/registry/clover-ui/token-fall").then((m) => m.TokenFall),
  { ssr: false },
);

// Steps through `length` states every `ms`, so previews keep changing on their own.
function useCycle(length: number, ms: number) {
  const [index, setIndex] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % length), ms);
    return () => clearInterval(id);
  }, [length, ms]);
  return index;
}

const CUBE_THEMES = ["violet", "green", "ember", "ice"] as const;

export function GrainCubePreview() {
  const theme = CUBE_THEMES[useCycle(CUBE_THEMES.length, 3000)];
  return (
    <div className="w-full max-w-[190px]">
      <GrainCube theme={theme} grain={0.15} />
    </div>
  );
}

const GRID_STYLES = [
  { pattern: "random", color: "#E1E900" },
  { pattern: "wave", color: "#22d3ee" },
  { pattern: "diagonal", color: "#f472b6" },
  { pattern: "center", color: "#a78bfa" },
] as const;

export function GridRevealPreview() {
  const style = GRID_STYLES[useCycle(GRID_STYLES.length, 3200)];
  return (
    <GridReveal
      key={style.pattern}
      rows={6}
      cols={6}
      color={style.color}
      pattern={style.pattern}
      loop
      loopDelay={0.5}
      blockDuration={0.28}
      stagger={0.03}
      className="aspect-square w-full max-w-[170px] rounded-xl"
    />
  );
}

const GAUGES = [
  { value: 89, suffix: "x", label: "faster", color: "#E1E900" },
  { value: 42, suffix: "%", label: "lighter", color: "#22d3ee" },
  { value: 120, suffix: "fps", label: "smooth", color: "#f472b6" },
];

export function GaugePreview() {
  const gauge = GAUGES[useCycle(GAUGES.length, 3200)];
  return <GaugeText key={gauge.label} {...gauge} className="text-3xl font-semibold" />;
}

export function AppleMusicPreview() {
  return (
    <div className="flex size-full items-center justify-center">
      <AppleMusicCard
        url="https://music.apple.com/us/song/blinding-lights/1499378108"
        className="mx-auto"
      />
    </div>
  );
}

const WORDS = ["generates", "gathers", "glows"];

export function NucleusPreview() {
  const word = WORDS[useCycle(WORDS.length, 4000)];
  return (
    <NucleusText key={word} className="text-center text-4xl font-semibold tracking-[-0.055em]">
      {word}
    </NucleusText>
  );
}

export function DropTextPreview() {
  const run = useCycle(2, 3500);
  return (
    <DropText
      key={run}
      stagger={0.065}
      className="text-center text-3xl font-semibold tracking-tight"
    >
      Dropping in.
    </DropText>
  );
}

const SOFT_COLORS: SoftColor[] = ["lime", "blue", "pink", "orange", "purple"];

export function SoftButtonPreview() {
  const color = SOFT_COLORS[useCycle(SOFT_COLORS.length, 1600)];
  return <SoftButton color={color}>Explore</SoftButton>;
}

const PROGRESS = [18, 46, 72, 94, 60, 32];

export function RichProgressPreview() {
  const auto = PROGRESS[useCycle(PROGRESS.length, 1200)];
  // Once someone drags the bar, stop the auto cycle and keep their value.
  const [manual, setManual] = React.useState<number | null>(null);
  return (
    <div className="w-full max-w-[200px]">
      <RichProgress value={manual ?? auto} onChange={setManual} showValue={false} />
    </div>
  );
}

export function SpotlightPreview() {
  return (
    <p className="text-center text-3xl font-semibold tracking-tight">
      <SpotlightText items={["brands", "interfaces", "products"]} color="blue" />
    </p>
  );
}

export function TokenFallPreview() {
  return (
    <div className="relative size-full">
      <TokenFall count={24} minSize={14} maxSize={24} />
    </div>
  );
}
