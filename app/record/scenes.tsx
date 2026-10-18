"use client";

import { useEffect, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";
import { LiquidButton, type ElementName } from "@/registry/clover-ui/liquid-button";
import { SoftButton, type SoftColor } from "@/registry/clover-ui/soft-button";
import { ThemeToggle, type ThemeToggleTheme } from "@/registry/clover-ui/theme-toggle";
import { PriceRange, type PriceRangeKnob } from "@/registry/clover-ui/price-range";
import { SignPad } from "@/registry/clover-ui/sign-pad";
import { Switch } from "@/registry/clover-ui/switch";
import { Mic, type MicColor } from "@/registry/clover-ui/mic";
import { BlockText, type BlockTextTheme } from "@/registry/clover-ui/block-text";
import { RichText, type RichTextColor } from "@/registry/clover-ui/rich-text";
import { NucleusText } from "@/registry/clover-ui/nucleus-text";
import { DropText } from "@/registry/clover-ui/drop-text";
import { GlitchyText } from "@/registry/clover-ui/glitchy-text";
import { GaugeText } from "@/registry/clover-ui/gauge-text";
import { TextGif } from "@/registry/clover-ui/text-gif";
import { Clicky, type ClickyColor } from "@/registry/clover-ui/clicky";
import { Ghost, GhostProvider, type GhostColor } from "@/registry/clover-ui/ghost";
import {
  GridReveal,
  type GridRevealColor,
  type GridRevealPattern,
} from "@/registry/clover-ui/grid-reveal";
import { GrainCube, type GrainCubeTheme } from "@/registry/clover-ui/grain-cube";
import { CursorTag } from "@/registry/clover-ui/cursor-tag";
import { Spinner } from "@/registry/clover-ui/spinner";
import { PulseLoader } from "@/registry/clover-ui/pulse-loader";
import { ThinkingState, type ThinkingStateKind } from "@/registry/clover-ui/thinking-state";
import { RichProgress, type RichProgressColor } from "@/registry/clover-ui/rich-progress";
import { ReasoningEffort, type ReasoningEffortTheme } from "@/registry/clover-ui/reasoning-effort";
import { AppleMusicCard, type AppleMusicCardView } from "@/registry/clover-ui/apple-music-card";
import styles from "./recording-studio.module.css";

const TokenFall = dynamic(
  () => import("@/registry/clover-ui/token-fall").then((m) => m.TokenFall),
  { ssr: false },
);

function Pair({ children }: { children: ReactNode }) {
  return <div className={styles.pair}>{children}</div>;
}

function SingleToggle() {
  const [theme, setTheme] = useState<ThemeToggleTheme>("light");
  return <ThemeToggle size="lg" theme={theme} onThemeChange={setTheme} />;
}

function ThinkingCycle() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(
      () => setIndex((value) => (value + 1) % thinking.length),
      1800,
    );
    return () => window.clearInterval(timer);
  }, []);
  return <ThinkingState state={thinking[index]} pixel="circle" className={styles.clickText} />;
}

function Progress({ color }: { color: RichProgressColor }) {
  const [value, setValue] = useState(65);
  return (
    <div className={styles.ranges}>
      <RichProgress value={value} onChange={setValue} color={color} label="Rainbow glow" />
    </div>
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

function ShrinkingMusicCard() {
  const [view, setView] = useState<AppleMusicCardView>("full");
  useEffect(() => {
    const timer = window.setTimeout(() => setView("mini"), 1600);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <AppleMusicCard url="https://music.apple.com/us/song/blinding-lights/1499378607" view={view} />
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

function Ghosts({ colors }: { colors: GhostColor[] }) {
  return (
    <div className={styles.ghosts}>
      {colors.map((color) => (
        <div key={color} className={styles.ghostArea}>
          <GhostProvider ghost={false}>
            <Ghost color={color} size="lg" boundary="parent" thoughts={["hey", "boo", "nice"]} />
          </GhostProvider>
        </div>
      ))}
    </div>
  );
}

const liquid: ElementName[] = ["lava", "ocean", "stone", "sky", "obsidian"];
const soft: SoftColor[] = [
  "lime",
  "purple",
  "blue",
  "pink",
  "red",
  "green",
  "orange",
  "cyan",
  "darkRed",
  "yellow",
  "white",
  "black",
];
const microphones: MicColor[][] = [
  ["blue", "purple"],
  ["pink", "emerald"],
  ["orange", "default"],
];
const blocks: BlockTextTheme[] = ["halloween", "ocean", "classic", "candy", "sunset"];
const rich: RichTextColor[] = [
  "blue",
  "accent",
  "purple",
  "pink",
  "emerald",
  "orange",
  "default",
  "rose",
];
const clicky: ClickyColor[][] = [
  ["purple", "blue"],
  ["pink", "emerald"],
  ["orange", "default"],
];
const ghosts: GhostColor[][] = [
  ["lime", "lilac"],
  ["white", "pink"],
  ["peach", "lemon"],
  ["mint", "sky"],
];
const cubes: GrainCubeTheme[][] = [["green"]];
const switchColors = ["#42aa78", "#8b5cf6", "#111111", "#e75a3c", "#d6a93f", "#3488da"];
const knobs: PriceRangeKnob[][] = [
  ["circle", "ring"],
  ["pill", "line"],
];

const thinking: ThinkingStateKind[] = ["pondering", "building"];
const progress: RichProgressColor[] = ["default", "blue", "pink", "emerald", "orange", "violet"];
const efforts: ReasoningEffortTheme[] = ["aurora", "ocean", "ember", "forest", "mono"];
const gifs = ["/fire.gif", "/aurora.gif", "/ocean.gif", "/seal.gif"];
const grids: [GridRevealColor, GridRevealPattern][] = [
  ["yellow", "random"],
  ["violet", "wave"],
];

type RecordingScene = {
  id: string;
  name: string;
  variants: number;
  render: (variant: number) => ReactNode;
};

const scenes: RecordingScene[] = [
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
    id: "drop-text",
    name: "Drop Text",
    variants: 1,
    render: () => (
      <DropText delay={0.3} className={styles.displayText}>
        Ready to drop in.
      </DropText>
    ),
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
    id: "spinner",
    name: "Spinner",
    variants: 1,
    render: () => <Spinner color="#0B87DA" size={64} tailLength={0.4} />,
  },
  {
    id: "rich-progress",
    name: "Rich Progress",
    variants: progress.length,
    render: (v) => <Progress color={progress[v]} />,
  },
  {
    id: "thinking-state",
    name: "Thinking State",
    variants: 1,
    render: () => <ThinkingCycle />,
  },
  {
    id: "reasoning-effort",
    name: "Reasoning Effort",
    variants: efforts.length,
    render: (v) => <ReasoningEffort theme={efforts[v]} recommended={2} />,
  },
  {
    id: "pulse-loader",
    name: "Pulse Loader",
    variants: 1,
    render: () => <PulseLoader size={96} />,
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
    id: "soft-button",
    name: "Soft Button",
    variants: soft.length,
    render: (v) => <SoftButton color={soft[v]}>Get started</SoftButton>,
  },
  {
    id: "theme-toggle",
    name: "Theme Toggle",
    variants: 1,
    render: () => <SingleToggle />,
  },
  {
    id: "price-range",
    name: "Price Range",
    variants: knobs.length,
    render: (v) => (
      <div className={styles.ranges}>
        {knobs[v].map((knob, i) => (
          <PriceRange
            key={knob}
            knob={knob}
            color={i ? "indigo" : "default"}
            defaultValue={i ? [50000, 150000] : [30000, 120000]}
            aria-label={`${knob} price range`}
          />
        ))}
      </div>
    ),
  },
  {
    id: "sign-pad",
    name: "Sign Pad",
    variants: 1,
    render: () => <SignPad />,
  },
  {
    id: "switch",
    name: "Switch",
    variants: switchColors.length,
    render: (v) => <Switch color={switchColors[v]} size="lg" defaultChecked aria-label="Switch" />,
  },
  {
    id: "mic",
    name: "Mic",
    variants: microphones.length,
    render: (v) => (
      <Pair>
        {microphones[v].map((color) => (
          <Mic key={color} color={color} size="lg" />
        ))}
      </Pair>
    ),
  },
  {
    id: "rich-text",
    name: "Rich Text",
    variants: rich.length,
    render: (v) => (
      <RichText color={rich[v]} className={styles.displayText}>
        Built with care.
      </RichText>
    ),
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
    id: "text-gif",
    name: "Text GIF",
    variants: gifs.length,
    render: (v) => (
      <TextGif src={gifs[v]} className={`${styles.displayText} font-black`}>
        CLOVER
      </TextGif>
    ),
  },
  {
    id: "clicky",
    name: "Clicky",
    variants: clicky.length,
    render: (v) => (
      <div className={styles.textStack}>
        {clicky[v].map((color, i) => (
          <Clicky key={color} color={color} delay={i ? 0.8 : 0.2}>
            <span className={styles.clickText}>{i ? "Try this" : "Click here"}</span>
          </Clicky>
        ))}
      </div>
    ),
  },
  {
    id: "ghost",
    name: "Ghost",
    variants: ghosts.length,
    render: (v) => <Ghosts colors={ghosts[v]} />,
  },
  {
    id: "grid-reveal",
    name: "Grid Reveal",
    variants: grids.length,
    render: (v) => <Grid color={grids[v][0]} pattern={grids[v][1]} />,
  },
  {
    id: "grain-cube",
    name: "Grain Cube",
    variants: cubes.length,
    render: (v) => <Cubes themes={cubes[v]} />,
  },
  {
    id: "apple-music-card",
    name: "Apple Music Card",
    variants: 1,
    render: () => <ShrinkingMusicCard />,
  },
  {
    id: "token-fall",
    name: "Token Fall",
    variants: 1,
    render: () => (
      <div className={styles.fill}>
        <TokenFall count={55} minSize={12} maxSize={25} />
      </div>
    ),
  },
  {
    id: "cursor-tag",
    name: "Cursor Tag",
    variants: 1,
    render: () => <CursorTag label="Designer" color="#7c3aed" size="lg" />,
  },
];

const order = [
  "soft-button",
  "block-text",
  "reasoning-effort",
  "grain-cube",
  "liquid-button",
  "nucleus-text",
  "cursor-tag",
  "gauge-text",
  "grid-reveal",
  "thinking-state",
  "token-fall",
];

export const recordingScenes = order.map((id) => scenes.find((scene) => scene.id === id)!);
