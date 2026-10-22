"use client";

import * as React from "react";
import { Switch } from "@/registry/clover-ui/switch";

function SwitchControlledExample() {
  const [enabled, setEnabled] = React.useState(true);

  return (
    <div className="flex flex-col items-center gap-4">
      <Switch aria-label="Wi-Fi" checked={enabled} onCheckedChange={setEnabled} />
      <p className="text-muted-foreground text-sm">Wi-Fi is {enabled ? "on" : "off"}</p>
    </div>
  );
}

function SwitchColorExample() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <Switch aria-label="Blue" color="#0b87da" />
      <Switch aria-label="Purple" color="#7c3aed" />
      <Switch aria-label="Orange" color="#f97316" />
    </div>
  );
}

function SwitchSizeExample() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <Switch aria-label="Small" size="sm" />
      <Switch aria-label="Default" />
      <Switch aria-label="Large" size="lg" />
    </div>
  );
}

function SwitchNoLabelsExample() {
  return <Switch aria-label="Dark mode" showLabels={false} />;
}

export { SwitchColorExample, SwitchControlledExample, SwitchNoLabelsExample, SwitchSizeExample };
