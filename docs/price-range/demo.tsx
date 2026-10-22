"use client";

import * as React from "react";
import { PriceRange, type PriceRangeValue } from "@/registry/clover-ui/price-range";

export function Demo() {
  const [value, setValue] = React.useState<PriceRangeValue>([30000, 120000]);

  return <PriceRange value={value} onValueChange={setValue} />;
}
