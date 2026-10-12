"use client";

import { useState, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { CloverLogo } from "@/components/seed/clover-logo";
import { LiquidButton, type ElementName } from "@/registry/clover-ui/liquid-button";
import { SoftButton, type SoftColor } from "@/registry/clover-ui/soft-button";
import { ThemeToggle, type ThemeToggleTheme } from "@/registry/clover-ui/theme-toggle";
import { PriceRange, type PriceRangeKnob } from "@/registry/clover-ui/price-range";
import { SignPad } from "@/registry/clover-ui/sign-pad";
import { GlossySwitch } from "@/registry/clover-ui/glossy-switch";
import { Mic, type MicColor } from "@/registry/clover-ui/mic";
import { BlockText, type BlockTextTheme } from "@/registry/clover-ui/block-text";
import { RichText, type RichTextColor } from "@/registry/clover-ui/rich-text";
import { NucleusText } from "@/registry/clover-ui/nucleus-text";
import { GlitchText } from "@/registry/clover-ui/glitch-text";
import { Clicky, type ClickyColor } from "@/registry/clover-ui/clicky";
import { Ghost, GhostProvider, type GhostColor } from "@/registry/clover-ui/ghost";
import {
  GridReveal,
  type GridRevealColor,
  type GridRevealPattern,
} from "@/registry/clover-ui/grid-reveal";
import { GrainCube, type GrainCubeTheme } from "@/registry/clover-ui/grain-cube";
import { CursorTag } from "@/registry/clover-ui/cursor-tag";
import styles from "./recording-studio.module.css";

function Pair({ children }: { children: ReactNode }) {
  return <div className={styles.pair}>{children}</div>;
}

function TogglePair() {
  const [first, setFirst] = useState<ThemeToggleTheme>("light");
  const [second, setSecond] = useState<ThemeToggleTheme>("dark");
  return (
    <Pair>
      <ThemeToggle size="lg" theme={first} onThemeChange={setFirst} />
      <ThemeToggle size="lg" theme={second} onThemeChange={setSecond} />
    </Pair>
  );
}

function Grids({ variant }: { variant: number }) {
  const still = Boolean(useReducedMotion());
  const looks: [GridRevealColor, GridRevealPattern][][] = [
    [
      ["yellow", "random"],
      ["violet", "wave"],
    ],
    [
      ["blue", "diagonal"],
      ["pink", "center"],
    ],
    [
      ["red", "random"],
      ["green", "wave"],
    ],
    [
      ["orange", "diagonal"],
      ["white", "center"],
    ],
  ];
  return (
    <div className={styles.squares}>
      {looks[variant].map(([color, pattern]) => (
        <GridReveal
          key={color}
          color={color}
          pattern={pattern}
          rows={8}
          cols={8}
          blockDuration={still ? 0 : 0.28}
          stagger={still ? 0 : 0.018}
          loop={!still}
          loopDelay={1.8}
          className="aspect-square w-full"
        >
          <div className="flex aspect-square items-center justify-center rounded-2xl bg-neutral-950">
            <CloverLogo size={64} />
          </div>
        </GridReveal>
      ))}
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

const liquid: ElementName[][] = [["lava", "ocean"], ["stone", "sky"], ["obsidian"]];
const soft: SoftColor[][] = [
  ["lime", "purple"],
  ["blue", "pink"],
  ["red", "green"],
  ["orange", "cyan"],
  ["darkRed", "yellow"],
  ["white", "black"],
];
const microphones: MicColor[][] = [
  ["blue", "purple"],
  ["pink", "emerald"],
  ["orange", "default"],
];
const blocks: BlockTextTheme[][] = [["halloween", "ocean"], ["classic", "candy"], ["sunset"]];
const rich: RichTextColor[][] = [
  ["blue", "accent"],
  ["purple", "pink"],
  ["emerald", "orange"],
  ["default", "rose"],
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
const cubes: GrainCubeTheme[][] = [["green", "violet"], ["ember", "ice"], ["mono"]];
const switchColors = [
  ["#42aa78", "#8b5cf6"],
  ["#111111", "#e75a3c"],
  ["#d6a93f", "#3488da"],
];
const knobs: PriceRangeKnob[][] = [
  ["circle", "ring"],
  ["pill", "line"],
];

export const recordingScenes: {
  id: string;
  name: string;
  variants: number;
  render: (variant: number) => ReactNode;
}[] = [
  {
    id: "liquid-button",
    name: "Liquid Button",
    variants: liquid.length,
    render: (v) => (
      <Pair>
        {liquid[v].map((element) => (
          <LiquidButton key={element} element={element} size="lg">
            Get started
          </LiquidButton>
        ))}
      </Pair>
    ),
  },
  {
    id: "soft-button",
    name: "Soft Button",
    variants: soft.length,
    render: (v) => (
      <Pair>
        {soft[v].map((color) => (
          <SoftButton key={color} color={color} size="lg">
            Explore Clover
          </SoftButton>
        ))}
      </Pair>
    ),
  },
  {
    id: "theme-toggle",
    name: "Theme Toggle",
    variants: 1,
    render: () => <TogglePair />,
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
    id: "glossy-switch",
    name: "Glossy Switch",
    variants: switchColors.length,
    render: (v) => (
      <Pair>
        {switchColors[v].map((color, i) => (
          <GlossySwitch
            key={color}
            color={color}
            size="lg"
            defaultChecked={!i}
            aria-label={i ? "Secondary switch" : "Primary switch"}
          />
        ))}
      </Pair>
    ),
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
    id: "block-text",
    name: "Block Text",
    variants: blocks.length,
    render: (v) => (
      <div className={styles.textStack}>
        {blocks[v].map((theme) => (
          <BlockText
            key={theme}
            theme={theme}
            words={["Build", "Play", "Ship"]}
            className={styles.displayText}
          />
        ))}
      </div>
    ),
  },
  {
    id: "rich-text",
    name: "Rich Text",
    variants: rich.length,
    render: (v) => (
      <div className={styles.textStack}>
        {rich[v].map((color, i) => (
          <RichText key={color} color={color} className={styles.displayText}>
            {i ? "Made to feel." : "Built with care."}
          </RichText>
        ))}
      </div>
    ),
  },
  {
    id: "nucleus-text",
    name: "Nucleus Text",
    variants: 2,
    render: (v) => (
      <NucleusText color={v ? "#c4a1ff" : "#b8ff8b"} className={styles.displayText}>
        generates
      </NucleusText>
    ),
  },
  {
    id: "glitch-text",
    name: "Glitch Text",
    variants: 2,
    render: (v) => (
      <GlitchText
        colors={v ? ["#a3e635", "#a78bfa"] : ["#ff3355", "#22d3ee"]}
        className={styles.displayText}
      >
        SIGNAL LOST
      </GlitchText>
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
    variants: 4,
    render: (v) => <Grids variant={v} />,
  },
  {
    id: "grain-cube",
    name: "Grain Cube",
    variants: cubes.length,
    render: (v) => <Cubes themes={cubes[v]} />,
  },
  {
    id: "cursor-tag",
    name: "Cursor Tag",
    variants: 2,
    render: (v) => (
      <div className={styles.cursorScene}>
        <span className={styles.clickText}>Made to move.</span>
        <CursorTag label="Purpose" color={v ? "#e85b3e" : "#7c3aed"} className={styles.cursorOne} />
        <CursorTag
          label="You"
          color={v ? "#0284c7" : "#db2777"}
          side="left"
          className={styles.cursorTwo}
        />
        <CursorTag
          label="Clover"
          color={v ? "#9e7b16" : "#16a34a"}
          className={styles.cursorThree}
        />
      </div>
    ),
  },
];
