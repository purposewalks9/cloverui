"use client";

import { SignalGlobe, type GlobeServer } from "@/registry/clover-ui/signal-globe";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const server: GlobeServer = {
  id: "iad-1",
  label: "Ashburn",
  region: "us-east-1",
  lat: 39.0438,
  lng: -77.4874,
};

const requests = [
  { id: "singapore", origin: { lat: 1.3521, lng: 103.8198, label: "Singapore" }, kind: "api" },
  { id: "berlin", origin: { lat: 52.52, lng: 13.405, label: "Berlin" }, kind: "api" },
  {
    id: "buenos-aires",
    origin: { lat: -34.6037, lng: -58.3816, label: "Buenos Aires" },
    kind: "upload",
  },
  { id: "nairobi", origin: { lat: -1.2921, lng: 36.8219, label: "Nairobi" }, kind: "stream" },
  { id: "auckland", origin: { lat: -36.8485, lng: 174.7633, label: "Auckland" }, kind: "api" },
];

const controls: ControlDef[] = [
  { type: "number", prop: "maxFlights", label: "Maximum flights", min: 16, max: 200, step: 8 },
  {
    type: "number",
    prop: "flightDuration",
    label: "Flight duration",
    min: 400,
    max: 6000,
    step: 200,
  },
  { type: "number", prop: "retention", label: "Retention", min: 0, max: 6000, step: 200 },
  { type: "boolean", prop: "autoRotate", label: "Auto rotate" },
  { type: "boolean", prop: "interactive", label: "Interactive" },
  { type: "boolean", prop: "animate", label: "Animate" },
];

const defaultProps = {
  maxFlights: 96,
  flightDuration: 1800,
  retention: 2200,
  autoRotate: true,
  interactive: true,
  animate: true,
};

export function SignalGlobePlayground() {
  return (
    <PlaygroundShell
      componentName="SignalGlobe"
      controls={controls}
      defaultProps={defaultProps}
      codeNote="pass your current rolling request array and one selected server location"
      render={(values) => (
        <SignalGlobe
          server={server}
          requests={requests}
          maxFlights={values.maxFlights as number}
          flightDuration={values.flightDuration as number}
          retention={values.retention as number}
          autoRotate={values.autoRotate as boolean}
          interactive={values.interactive as boolean}
          animate={values.animate as boolean}
          className="h-[440px]"
        />
      )}
    />
  );
}
