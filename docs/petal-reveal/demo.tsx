import { PetalReveal } from "@/registry/clover-ui/petal-reveal";

export function Demo() {
  return (
    <PetalReveal className="aspect-square w-full max-w-[220px]">
      <div className="flex aspect-square w-full items-center justify-center">
        <div className="text-center">
          <p className="text-base font-medium tracking-tight">Petal Reveal</p>
          <p className="text-muted-foreground mt-1 text-xs">Blown away.</p>
        </div>
      </div>
    </PetalReveal>
  );
}
