"use client";

import { useState } from "react";
import { RichProgress } from "@/registry/clover-ui/rich-progress";

export function Demo() {
  const [value, setValue] = useState(65);

  return (
    <RichProgress
      value={value}
      onChange={setValue}
      label="Rainbow glow"
    />
  );
}