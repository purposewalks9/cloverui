"use client";

import * as React from "react";

import { PinDrop } from "@/registry/clover-ui/pin-drop";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  { type: "text", prop: "place", label: "Place" },
  { type: "boolean", prop: "locate", label: "Use my location" },
  { type: "number", prop: "size", label: "Size", min: 200, max: 480, step: 20 },
  { type: "number", prop: "autoRotateSpeed", label: "Rotate speed", min: 1, max: 30, step: 1 },
  { type: "boolean", prop: "autoRotate", label: "Auto rotate" },
  { type: "boolean", prop: "interactive", label: "Interactive" },
  { type: "number", prop: "relief", label: "Relief", min: 0, max: 3, step: 0.25 },
  { type: "boolean", prop: "showAtmosphere", label: "Atmosphere" },
  { type: "boolean", prop: "marker", label: "Marker" },
  { type: "boolean", prop: "markerZoom", label: "Marker zoom" },
];

const defaultProps = {
  place: "London",
  locate: false,
  size: 360,
  autoRotateSpeed: 6,
  autoRotate: true,
  interactive: true,
  relief: 1,
  showAtmosphere: true,
  marker: true,
  markerZoom: true,
};

const TOUR = [
  "London",
  "Lagos",
  "Tokyo",
  "New York",
  "Rio de Janeiro",
  "Sydney",
  "Cairo",
  "Paris",
  "Mumbai",
  "Mexico City",
];

function useTour() {
  const [index, setIndex] = React.useState(0);
  React.useEffect(() => {
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % TOUR.length), 4500);
    return () => window.clearInterval(timer);
  }, []);
  return TOUR[index];
}

export function PinDropPlayground() {
  const tour = useTour();
  return (
    <PlaygroundShell
      componentName="PinDrop"
      controls={controls}
      defaultProps={defaultProps}
      codeNote="only turn locate on after the user asks to share their location"
      render={(values) => (
        <PinDrop
          place={tour}
          locate={values.locate as boolean}
          texture="/textures/earth-land.png"
          size={values.size as number}
          autoRotateSpeed={values.autoRotateSpeed as number}
          autoRotate={values.autoRotate as boolean}
          interactive={values.interactive as boolean}
          relief={values.relief as number}
          showAtmosphere={values.showAtmosphere as boolean}
          marker={values.marker as boolean}
          markerZoom={values.markerZoom as boolean}
        />
      )}
    />
  );
}
