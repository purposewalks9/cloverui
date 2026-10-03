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
import { CursorTag } from "@/registry/clover-ui/cursor-tag";
import { Mic } from "@/registry/clover-ui/mic";
import { Clicky } from "@/registry/clover-ui/clicky";
import { TextGif } from "@/registry/clover-ui/text-gif";
import { cn } from "@/lib/utils";

const TokenFall = dynamic(
  () => import("@/registry/clover-ui/token-fall").then((m) => m.TokenFall),
  { ssr: false },
);

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
  { pattern: "random", color: "graphite" },
  { pattern: "wave", color: "ocean" },
  { pattern: "diagonal", color: "burgundy" },
  { pattern: "center", color: "plum" },
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
      className="aspect-square w-full max-w-[170px]"
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

const SONGS = [
  "https://music.apple.com/us/song/blinding-lights/1499378607",
  "https://music.apple.com/us/song/levitating/1538003843",
  "https://music.apple.com/us/song/as-it-was/1615585008",
  "https://music.apple.com/us/song/flowers/1674691586",
  "https://music.apple.com/us/song/espresso/1744253558",
];

export function AppleMusicPreview() {
  const active = useCycle(SONGS.length, 4000);
  return (
    <div className="grid w-full max-w-[176px] *:col-start-1 *:row-start-1">
      {SONGS.map((url, i) => (
        <AppleMusicCard
          key={url}
          url={url}
          aria-hidden={i !== active}
          className={cn(
            "rounded-3xl transition-opacity duration-700",
            i === active ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        />
      ))}
    </div>
  );
}

const NUCLEUS = [
  { word: "generates", color: "#8b5cf6" },
  { word: "gathers", color: "#0ea5e9" },
  { word: "glows", color: "#f43f5e" },
  { word: "glitters", color: "#f59e0b" },
];

export function NucleusPreview() {
  const { word, color } = NUCLEUS[useCycle(NUCLEUS.length, 4000)];
  return (
    <NucleusText
      key={word}
      color={color}
      className="text-center text-4xl font-semibold tracking-[-0.055em]"
    >
      {word}
    </NucleusText>
  );
}

export function CursorTagPreview() {
  return <CursorTag label="Designer" color="#7c3aed" size="lg" />;
}

export function ClickyPreview() {
  return (
    <Clicky>
      <span className="text-3xl font-semibold tracking-tight">Click here</span>
    </Clicky>
  );
}

export function MicPreview() {
  return <Mic size="lg" />;
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
  const [manual, setManual] = React.useState<number | null>(null);
  return (
    <div className="w-full max-w-[200px]">
      <RichProgress value={manual ?? auto} onChange={setManual} showValue={false} />
    </div>
  );
}

export function TokenFallPreview() {
  return (
    <div className="relative size-full">
      <TokenFall count={80} minSize={10} maxSize={18} spawnInterval={60} />
    </div>
  );
}

export function TextGifPreview() {
  return (
    <TextGif src="/fire.gif" className="text-center text-5xl font-black tracking-[-0.05em]">
      CLOVER
    </TextGif>
  );
}
