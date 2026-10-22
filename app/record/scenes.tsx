"use client";

import { useState, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import {
  LiquidButton,
  elementPalettes,
  type ElementName,
} from "@/registry/clover-ui/liquid-button";
import { SoftButton, type SoftColor } from "@/registry/clover-ui/soft-button";
import { ThemeToggle, type ThemeToggleTheme } from "@/registry/clover-ui/theme-toggle";
import { BLOCK_TEXT_THEMES, BlockText, type BlockTextTheme } from "@/registry/clover-ui/block-text";
import { NucleusText } from "@/registry/clover-ui/nucleus-text";
import { GlitchyText } from "@/registry/clover-ui/glitchy-text";
import { GaugeText } from "@/registry/clover-ui/gauge-text";
import {
  GRID_REVEAL_COLORS,
  GridReveal,
  type GridRevealColor,
  type GridRevealPattern,
} from "@/registry/clover-ui/grid-reveal";
import { GrainCube, type GrainCubeTheme } from "@/registry/clover-ui/grain-cube";
import {
  SPECTRUM_BARS_THEMES,
  SpectrumBars,
  type SpectrumBarsTheme,
} from "@/registry/clover-ui/spectrum-bars";
import { CursorTag } from "@/registry/clover-ui/cursor-tag";
import { ThinkingState, thinkingStateColors } from "@/registry/clover-ui/thinking-state";
import { EffortSlider, type EffortSliderTheme } from "@/registry/clover-ui/effort-slider";
import { AuthButton, type AuthProvider } from "@/registry/clover-ui/auth-button";
import styles from "./recording-studio.module.css";

function SingleToggle() {
  const [theme, setTheme] = useState<ThemeToggleTheme>("light");
  return <ThemeToggle size="lg" theme={theme} onThemeChange={setTheme} />;
}

function ThinkingCycle() {
  return (
    <ThinkingState state="pondering" pixel="circle" className={`${styles.clickText} gap-[0.2em]`} />
  );
}

function Grid({ color, pattern }: { color: GridRevealColor; pattern: GridRevealPattern }) {
  const still = Boolean(useReducedMotion());
  return (
    <div className={styles.squares}>
      <GridReveal
        color={color}
        pattern={pattern}
        rows={8}
        cols={8}
        blockDuration={still ? 0 : 0.28}
        stagger={still ? 0 : 0.018}
        loop={!still}
        loopDelay={0.4}
        className="aspect-square w-full"
      >
        <div className="aspect-square" />
      </GridReveal>
    </div>
  );
}

function Cubes({ themes }: { themes: GrainCubeTheme[] }) {
  const still = Boolean(useReducedMotion());
  return (
    <div className={styles.squares}>
      {themes.map((theme) => (
        <GrainCube key={theme} theme={theme} animate={!still} />
      ))}
    </div>
  );
}

const liquid: ElementName[] = ["lava", "ocean", "stone", "sky", "obsidian"];
const soft: SoftColor[] = [
  "red",
  "lime",
  "purple",
  "blue",
  "pink",
  "green",
  "orange",
  "cyan",
  "darkRed",
  "yellow",
  "white",
  "black",
];
const blocks: BlockTextTheme[] = ["halloween", "ocean", "classic", "candy", "sunset"];
const cubes: GrainCubeTheme[][] = [["green"]];
const efforts: EffortSliderTheme[] = ["aurora", "ocean", "ember", "forest", "mono"];
const providers: AuthProvider[] = ["google", "github", "discord", "spotify", "notion", "chatgpt"];
const spectrums: SpectrumBarsTheme[] = ["signal", "neon", "sunset", "mono"];
const softStrokes: Record<SoftColor, string[]> = {
  red: ["#ff6b6b", "#ff2d2d", "#c91515"],
  darkRed: ["#ff4545", "#e31212", "#850808"],
  green: ["#a8d96a", "#63a928", "#347012"],
  lime: ["#efff78", "#b8ed20", "#63ae00"],
  blue: ["#72c7ff", "#278ff0", "#1554aa"],
  purple: ["#d08cff", "#9c4cff", "#5a229e"],
  orange: ["#ffd080", "#ff922e", "#c95008"],
  yellow: ["#fff99a", "#ffdc32", "#c89100"],
  pink: ["#ff9bdf", "#f04fbd", "#a81778"],
  cyan: ["#9dffff", "#28dce7", "#14828c"],
  white: ["#ffffff", "#f2f2f2", "#cdcdcd"],
  black: ["#555555", "#222222", "#555555"],
};
const providerStrokes: Partial<Record<AuthProvider, string[]>> = {
  google: ["#4285f4", "#ea4335", "#fbbc05", "#34a853"],
  github: ["#ffffff", "#8b949e"],
  discord: ["#5865f2", "#8891f2"],
  spotify: ["#1ed760", "#1db954"],
  notion: ["#ffffff", "#9b9a97"],
  chatgpt: ["#10a37f", "#ffffff"],
};
const effortStrokes: Record<EffortSliderTheme, string[]> = {
  aurora: ["#b4b7ee", "#c3aef0", "#f9a8d4"],
  ocean: ["#a9d8f0", "#9cc9f5", "#8fe3dc"],
  ember: ["#f5c99a", "#f7b48f", "#ff9e9e"],
  forest: ["#b6e3ad", "#a8e6a8", "#e2f09a"],
  mono: ["#d4d4d8", "#e4e4e7", "#fafafa"],
};
const pondering = thinkingStateColors("pondering");
const grids: [GridRevealColor, GridRevealPattern][] = [
  ["yellow", "random"],
  ["violet", "wave"],
];

type RecordingScene = {
  id: string;
  name: string;
  variants: number;
  size?: "wide";
  stroke: (variant: number) => string[];
  render: (variant: number) => ReactNode;
};

const scenes: RecordingScene[] = [
  {
    id: "soft-button",
    name: "Soft Button",
    variants: soft.length,
    stroke: (v) => softStrokes[soft[v]],
    render: (v) => <SoftButton color={soft[v]}>Get started</SoftButton>,
  },
  {
    id: "auth-button",
    name: "Auth Button",
    variants: providers.length,
    stroke: (v) => providerStrokes[providers[v]] ?? ["#ffffff"],
    render: (v) => <AuthButton provider={providers[v]} size="lg" />,
  },
  {
    id: "block-text",
    name: "Block Text",
    variants: blocks.length,
    stroke: (v) => [...BLOCK_TEXT_THEMES[blocks[v]].colors],
    render: (v) => (
      <BlockText
        theme={blocks[v]}
        words={["Build", "Play", "Ship"]}
        interval={0.5}
        duration={0.5}
        className={styles.displayText}
      />
    ),
  },
  {
    id: "effort-slider",
    name: "Effort Slider",
    variants: efforts.length,
    stroke: (v) => effortStrokes[efforts[v]],
    render: (v) => <EffortSlider theme={efforts[v]} recommended={2} />,
  },
  {
    id: "grain-cube",
    name: "Grain Cube",
    variants: cubes.length,
    stroke: () => ["#25e15f", "#52c4dc", "#e6b92c"],
    render: (v) => <Cubes themes={cubes[v]} />,
  },
  {
    id: "liquid-button",
    name: "Liquid Button",
    variants: liquid.length,
    stroke: (v) => elementPalettes[liquid[v]].colors,
    render: (v) => (
      <LiquidButton element={liquid[v]} size="lg">
        Get started
      </LiquidButton>
    ),
  },
  {
    id: "nucleus-text",
    name: "Nucleus Text",
    variants: 2,
    stroke: (v) => [v ? "#ff9f6b" : "#7cc4ff"],
    render: (v) => (
      <NucleusText color={v ? "#ff9f6b" : "#7cc4ff"} className={styles.displayText}>
        generates
      </NucleusText>
    ),
  },
  {
    id: "cursor-tag",
    name: "Cursor Tag",
    variants: 1,
    stroke: () => ["#7c3aed", "#a78bfa"],
    render: () => <CursorTag label="Designer" color="#7c3aed" size="lg" />,
  },
  {
    id: "gauge-text",
    name: "Gauge Text",
    variants: 1,
    stroke: () => ["#e1e900", "#f5f7a0"],
    render: () => (
      <GaugeText
        value={89}
        suffix="x"
        label="faster"
        color="#E1E900"
        className={styles.displayText}
      />
    ),
  },
  {
    id: "grid-reveal",
    name: "Grid Reveal",
    variants: grids.length,
    stroke: (v) => [GRID_REVEAL_COLORS[grids[v][0]]],
    render: (v) => <Grid color={grids[v][0]} pattern={grids[v][1]} />,
  },
  {
    id: "glitchy-text",
    name: "Glitchy Text",
    variants: 1,
    stroke: () => ["#ef4444", "#22d3ee"],
    render: () => (
      <GlitchyText color="pixel" trigger="always" intensity={0.7} className={styles.displayText}>
        SIGNAL LOST
      </GlitchyText>
    ),
  },
  {
    id: "thinking-state",
    name: "Thinking State",
    variants: 1,
    stroke: () => [pondering.dark, pondering.light],
    render: () => <ThinkingCycle />,
  },
  {
    id: "spectrum-bars",
    name: "Spectrum Bars",
    variants: spectrums.length,
    stroke: (v) => SPECTRUM_BARS_THEMES[spectrums[v]],
    render: (v) => <SpectrumBars theme={spectrums[v]} className={styles.fill} />,
  },
  {
    id: "theme-toggle",
    name: "Theme Toggle",
    variants: 1,
    stroke: () => ["#ffffff", "#a3a3a3"],
    render: () => <SingleToggle />,
  },
];

export const recordingScenes = scenes;
