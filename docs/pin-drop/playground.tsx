"use client";

import { PinDrop, type PinDropTheme } from "@/registry/clover-ui/pin-drop";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  { type: "text", prop: "place", label: "Place" },
  { type: "boolean", prop: "locate", label: "Use my location" },
  { type: "number", prop: "zoom", label: "Zoom", min: 3, max: 18, step: 1 },
  { type: "number", prop: "height", label: "Height", min: 240, max: 560, step: 20 },
  {
    type: "select",
    prop: "theme",
    label: "Theme",
    options: [
      { label: "Auto", value: "auto" },
      { label: "Light", value: "light" },
      { label: "Dark", value: "dark" },
    ],
  },
  { type: "boolean", prop: "interactive", label: "Interactive" },
  { type: "boolean", prop: "locateButton", label: "Locate button" },
  { type: "boolean", prop: "marker", label: "Marker" },
];

const defaultProps = {
  place: "London",
  locate: false,
  zoom: 12,
  height: 400,
  theme: "auto",
  interactive: true,
  locateButton: true,
  marker: true,
};

export function PinDropPlayground() {
  return (
    <PlaygroundShell
      componentName="PinDrop"
      controls={controls}
      defaultProps={defaultProps}
      codeNote="only turn locate on after the user asks to share their location"
      render={(values) => (
        <PinDrop
          place={values.place as string}
          locate={values.locate as boolean}
          zoom={values.zoom as number}
          height={values.height as number}
          theme={values.theme as PinDropTheme}
          interactive={values.interactive as boolean}
          locateButton={values.locateButton as boolean}
          marker={values.marker as boolean}
        />
      )}
    />
  );
}
