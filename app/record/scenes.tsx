"use client";

import { useState, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { LiquidButton, type ElementName } from "@/registry/clover-ui/liquid-button";
import { SoftButton, type SoftColor } from "@/registry/clover-ui/soft-button";
import { ThemeToggle, type ThemeToggleTheme } from "@/registry/clover-ui/theme-toggle";
import { BlockText, type BlockTextTheme } from "@/registry/clover-ui/block-text";
import { NucleusText } from "@/registry/clover-ui/nucleus-text";
import { GlitchyText } from "@/registry/clover-ui/glitchy-text";
import { GaugeText } from "@/registry/clover-ui/gauge-text";
import {
  GridReveal,
  type GridRevealColor,
  type GridRevealPattern,
} from "@/registry/clover-ui/grid-reveal";
import { GrainCube, type GrainCubeTheme } from "@/registry/clover-ui/grain-cube";
import { SpectrumBars, type SpectrumBarsTheme } from "@/registry/clover-ui/spectrum-bars";
import { CursorTag } from "@/registry/clover-ui/cursor-tag";
import { ThinkingState } from "@/registry/clover-ui/thinking-state";
import { EffortSlider, type EffortSliderTheme } from "@/registry/clover-ui/effort-slider";
import { AuthButton, type AuthProvider } from "@/registry/clover-ui/auth-button";
import { Butterflies, type ButterfliesSpecies } from "@/registry/clover-ui/butterflies";
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
const butterflies: ButterfliesSpecies[] = [
  "mixed",
  "monarch",
  "morpho",
  "swallowtail",
  "emerald",
  "violet",
];
const grids: [GridRevealColor, GridRevealPattern][] = [
  ["yellow", "random"],
  ["violet", "wave"],
];

type RecordingScene = {
  id: string;
  name: string;
  variants: number;
  size?: "wide";
  render: (variant: number) => ReactNode;
};

const scenes: RecordingScene[] = [
  {
    id: "soft-button",
    name: "Soft Button",
    variants: soft.length,
    render: (v) => <SoftButton color={soft[v]}>Get started</SoftButton>,
  },
  {
    id: "block-text",
    name: "Block Text",
    variants: blocks.length,
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
    id: "auth-button",
    name: "Auth Button",
    variants: providers.length,
    render: (v) => <AuthButton provider={providers[v]} size="lg" />,
  },
  {
    id: "effort-slider",
    name: "Effort Slider",
    variants: efforts.length,
    render: (v) => <EffortSlider theme={efforts[v]} recommended={2} />,
  },
  {
    id: "grain-cube",
    name: "Grain Cube",
    variants: cubes.length,
    render: (v) => <Cubes themes={cubes[v]} />,
  },
  {
    id: "liquid-button",
    name: "Liquid Button",
    variants: liquid.length,
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
    render: () => <CursorTag label="Designer" color="#7c3aed" size="lg" />,
  },
  {
    id: "gauge-text",
    name: "Gauge Text",
    variants: 1,
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
    render: (v) => <Grid color={grids[v][0]} pattern={grids[v][1]} />,
  },
  {
    id: "butterflies",
    name: "Butterflies",
    variants: butterflies.length,
    render: (v) => <Butterflies species={butterflies[v]} count={10} size={44} />,
  },
  {
    id: "glitchy-text",
    name: "Glitchy Text",
    variants: 1,
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
    render: () => <ThinkingCycle />,
  },
  {
    id: "theme-toggle",
    name: "Theme Toggle",
    variants: 1,
    render: () => <SingleToggle />,
  },
  {
    id: "spectrum-bars",
    name: "Spectrum Bars",
    variants: spectrums.length,
    render: (v) => <SpectrumBars theme={spectrums[v]} className={styles.fill} />,
  },
];

export const recordingScenes = scenes;
