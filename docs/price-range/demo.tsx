"use client";

import { useState } from "react";
import { PriceRange, type PriceRangeValue } from "@/registry/clover-ui/price-range";

export function Demo() {
  const [value, setValue] = useState<PriceRangeValue>([30000, 120000]);

  return <PriceRange value={value} onValueChange={setValue} />;
}
