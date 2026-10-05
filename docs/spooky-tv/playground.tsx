"use client";

import {
  SPOOKY_TV_PALETTES,
  SpookyTv,
  type SpookyTvPalette,
  type SpookyTvState,
} from "@/registry/clover-ui/spooky-tv";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const STATES: SpookyTvState[] = ["idle", "thinking", "working", "done", "error"];

const controls: ControlDef[] = [
  {
    type: "select",
    prop: "state",
    label: "State",
    options: STATES.map((state) => ({
      label: state[0].toUpperCase() + state.slice(1),
      value: state,
    })),
  },
  {
    type: "select",
    prop: "palette",
    label: "Palette",
    options: (Object.keys(SPOOKY_TV_PALETTES) as SpookyTvPalette[]).map((palette) => ({
      label: palette[0].toUpperCase() + palette.slice(1),
      value: palette,
      swatch: SPOOKY_TV_PALETTES[palette].body,
    })),
  },
  { type: "boolean", prop: "interactive", label: "Interactive" },
  { type: "boolean", prop: "animate", label: "Animate" },
];

const defaultProps = {
  state: "idle",
  palette: "pumpkin",
  interactive: true,
  animate: true,
};

export function SpookyTvPlayground() {
  return (
    <PlaygroundShell
      componentName="SpookyTv"
      controls={controls}
      defaultProps={defaultProps}
      render={(values) => (
        <SpookyTv
          state={values.state as SpookyTvState}
          palette={values.palette as SpookyTvPalette}
          interactive={values.interactive as boolean}
          animate={values.animate as boolean}
        />
      )}
    />
  );
}
