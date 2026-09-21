"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import type { ControlDef } from "@/lib/playground";
import { ColorField } from "./color-field";

interface ControlPanelProps {
  controls: ControlDef[];
  values: Record<string, unknown>;
  onChange: (prop: string, value: unknown) => void;
}

export function ControlPanel({ controls, values, onChange }: ControlPanelProps) {
  return (
    <div className="flex flex-col divide-y divide-border">
      {controls.map((control) => (
        <div
          key={control.prop}
          className="flex items-center justify-between gap-3 px-4 py-3"
        >
          <Label
            htmlFor={control.prop}
            className="text-xs font-normal text-muted-foreground"
          >
            {control.label}
          </Label>
          <Field
            control={control}
            value={values[control.prop]}
            onChange={(value) => onChange(control.prop, value)}
          />
        </div>
      ))}
    </div>
  );
}

function Field({
  control,
  value,
  onChange,
}: {
  control: ControlDef;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  switch (control.type) {
    case "text":
      return (
        <Input
          id={control.prop}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-32 text-xs"
        />
      );

    case "boolean":
      return (
        <Toggle
          id={control.prop}
          size="sm"
          pressed={Boolean(value)}
          onPressedChange={onChange}
        >
          {value ? "On" : "Off"}
        </Toggle>
      );

    case "select":
      return (
        <NativeSelect
          id={control.prop}
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-32 text-xs"
        >
          {control.options.map((opt) => (
            <NativeSelectOption key={opt.value} value={opt.value}>
              {opt.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      );

    case "number":
      return (
        <div className="flex w-32 items-center gap-2">
          <input
            id={control.prop}
            type="range"
            min={control.min ?? 0}
            max={control.max ?? 100}
            step={control.step ?? 1}
            value={(value as number) ?? 0}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full accent-foreground"
          />
          <span className="w-8 text-right font-mono text-[11px] text-muted-foreground">
            {value as number}
          </span>
        </div>
      );

    case "color":
      return <ColorField value={value as string} onChange={onChange} />;

    default:
      return null;
  }
}
