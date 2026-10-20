import { SpectrumBars } from "@/registry/clover-ui/spectrum-bars";

export function Demo() {
  return (
    <div className="relative aspect-[4/3] w-full max-w-[420px] overflow-hidden rounded-2xl">
      <SpectrumBars backgroundColor="var(--sidebar)" />
    </div>
  );
}
