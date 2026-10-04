"use client";

import { CityLocator } from "@/registry/clover-ui/city-locator";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  { type: "text", prop: "place", label: "Place" },
  { type: "boolean", prop: "locate", label: "Use my location" },
  { type: "number", prop: "size", label: "Size", min: 200, max: 480, step: 20 },
  { type: "number", prop: "autoRotateSpeed", label: "Rotate speed", min: 1, max: 30, step: 1 },
  { type: "boolean", prop: "autoRotate", label: "Auto rotate" },
  { type: "boolean", prop: "interactive", label: "Interactive" },
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
  showAtmosphere: true,
  marker: true,
  markerZoom: true,
};

export function CityLocatorPlayground() {
  return (
    <PlaygroundShell
      componentName="CityLocator"
      controls={controls}
      defaultProps={defaultProps}
      codeNote="only turn locate on after the user asks to share their location"
      render={(values) => (
        <CityLocator
          place={values.place as string}
          locate={values.locate as boolean}
          texture="/textures/earth.jpg"
          size={values.size as number}
          autoRotateSpeed={values.autoRotateSpeed as number}
          autoRotate={values.autoRotate as boolean}
          interactive={values.interactive as boolean}
          showAtmosphere={values.showAtmosphere as boolean}
          marker={values.marker as boolean}
          markerZoom={values.markerZoom as boolean}
        />
      )}
    />
  );
}
