"use client";

import { Check, ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

    case "select": {
      const selected = control.options.find((opt) => opt.value === value);
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              id={control.prop}
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-32 justify-between text-xs font-normal"
            >
              <span className="truncate">{selected?.label ?? "Select"}</span>
              <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            {control.options.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onSelect={() => onChange(opt.value)}
                className="justify-between text-xs"
              >
                {opt.label}
                {opt.value === value && (
                  <Check className="size-3.5 text-muted-foreground" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

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