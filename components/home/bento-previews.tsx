"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { BlockText } from "@/registry/clover-ui/block-text";
import type { SoftColor } from "@/registry/clover-ui/soft-button";
import type { ElementName } from "@/registry/clover-ui/liquid-button";
import type { PriceRangeValue } from "@/registry/clover-ui/price-range";
import type { ThinkingStateKind } from "@/registry/clover-ui/thinking-state";

const GrainCube = dynamic(
  () => import("@/registry/clover-ui/grain-cube").then((m) => m.GrainCube),
  { ssr: false },
);
const NucleusText = dynamic(
  () => import("@/registry/clover-ui/nucleus-text").then((m) => m.NucleusText),
  { ssr: false },
);
const GridReveal = dynamic(
  () => import("@/registry/clover-ui/grid-reveal").then((m) => m.GridReveal),
  { ssr: false },
);
const SoftButton = dynamic(
  () => import("@/registry/clover-ui/soft-button").then((m) => m.SoftButton),
  { ssr: false },
);
const ThinkingState = dynamic(
  () => import("@/registry/clover-ui/thinking-state").then((m) => m.ThinkingState),
  { ssr: false },
);
const CursorTag = dynamic(
  () => import("@/registry/clover-ui/cursor-tag").then((m) => m.CursorTag),
  { ssr: false },
);
const Clicky = dynamic(() => import("@/registry/clover-ui/clicky").then((m) => m.Clicky), {
  ssr: false,
});
const LiquidButton = dynamic(
  () => import("@/registry/clover-ui/liquid-button").then((m) => m.LiquidButton),
  { ssr: false },
);
const Switch = dynamic(() => import("@/registry/clover-ui/switch").then((m) => m.Switch), {
  ssr: false,
});
const PriceRange = dynamic(
  () => import("@/registry/clover-ui/price-range").then((m) => m.PriceRange),
  { ssr: false },
);
const SignPad = dynamic(() => import("@/registry/clover-ui/sign-pad").then((m) => m.SignPad), {
  ssr: false,
});

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
    <div className="w-full max-w-[150px]">
      <GrainCube theme={theme} grain={0.15} />
    </div>
  );
}

const GRID_STYLES = [
  { pattern: "random", color: "yellow" },
  { pattern: "wave", color: "blue" },
  { pattern: "diagonal", color: "red" },
  { pattern: "center", color: "green" },
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
      className="aspect-square w-full max-w-[160px]"
    />
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
      <span className="text-xl font-semibold tracking-tight sm:text-3xl">Click here</span>
    </Clicky>
  );
}

const THINKING_STATES: ThinkingStateKind[] = [
  "thinking",
  "analyzing",
  "debugging",
  "searching",
  "building",
  "pondering",
];

export function ThinkingStatePreview() {
  const state = THINKING_STATES[useCycle(THINKING_STATES.length, 2200)];
  return <ThinkingState state={state} className="text-xl" />;
}

const SOFT_COLORS: SoftColor[] = ["lime", "blue", "pink", "orange", "purple"];

export function SoftButtonPreview() {
  const color = SOFT_COLORS[useCycle(SOFT_COLORS.length, 1600)];
  return <SoftButton color={color}>Explore</SoftButton>;
}

const LIQUID_ELEMENTS: ElementName[] = ["lava", "ocean", "stone", "sky", "obsidian"];

export function LiquidButtonPreview() {
  const element = LIQUID_ELEMENTS[useCycle(LIQUID_ELEMENTS.length, 1600)];
  return (
    <LiquidButton element={element} size="lg">
      Explore
    </LiquidButton>
  );
}

export function BlockTextPreview() {
  return <BlockText words={["Trick", "Treat", "Boo!"]} theme="halloween" className="text-4xl" />;
}

export function SwitchPreview() {
  return <Switch aria-label="Power" size="lg" />;
}

export function PriceRangePreview() {
  const [value, setValue] = React.useState<PriceRangeValue>([30000, 120000]);
  return <PriceRange value={value} onValueChange={setValue} className="px-0" />;
}

export function SignPadPreview() {
  return <SignPad />;
}
