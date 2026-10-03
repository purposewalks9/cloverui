import { GridReveal } from "@/registry/clover-ui/grid-reveal";

export function Demo() {
  return (
    <GridReveal
      rows={8}
      cols={8}
      color="yellow"
      pattern="random"
      blockDuration={0.28}
      stagger={0.018}
      className="aspect-square w-full max-w-[220px]"
    >
      <div className="flex aspect-square w-full items-center justify-center">
        <div className="text-center">
          <p className="text-base font-medium tracking-tight">Grid Reveal</p>
          <p className="text-muted-foreground mt-1 text-xs">Scattered motion.</p>
        </div>
      </div>
    </GridReveal>
  );
}
