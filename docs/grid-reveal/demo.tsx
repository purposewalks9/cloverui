import { GridReveal } from "@/registry/clover-ui/grid-reveal";

export function Demo() {
  return (
    <GridReveal
      rows={8}
      cols={8}
      color="#E1E900"
      pattern="random"
      blockDuration={0.28}
      stagger={0.018}
      className="aspect-square w-full max-w-[220px]"
    >
      <div className="flex aspect-square w-full items-center justify-center">
        <div className="text-center">
          <p className="text-base font-medium tracking-tight">Grid Reveal</p>
          <p className="mt-1 text-xs text-muted-foreground">Scattered motion.</p>
        </div>
      </div>
    </GridReveal>
  );
}

export function WaveDemo() {
  return (
    <GridReveal
      rows={8}
      cols={8}
      color="#8B5CF6"
      pattern="wave"
      blockDuration={0.22}
      stagger={0.03}
      className="aspect-square w-full max-w-[220px]"
    >
      <div className="flex aspect-square w-full items-center justify-center">
        <div className="text-center">
          <p className="text-base font-medium tracking-tight">Wave</p>
          <p className="mt-1 text-xs text-muted-foreground">Column by column.</p>
        </div>
      </div>
    </GridReveal>
  );
}

export function DiagonalDemo() {
  return (
    <GridReveal
      rows={8}
      cols={8}
      color="#60A5FA"
      pattern="diagonal"
      blockDuration={0.24}
      stagger={0.02}
      className="aspect-square w-full max-w-[220px]"
    >
      <div className="flex aspect-square w-full items-center justify-center">
        <div className="text-center">
          <p className="text-base font-medium tracking-tight">Diagonal</p>
          <p className="mt-1 text-xs text-muted-foreground">Corner to corner.</p>
        </div>
      </div>
    </GridReveal>
  );
}

export function CenterDemo() {
  return (
    <GridReveal
      rows={8}
      cols={8}
      color="#F43F5E"
      pattern="center"
      blockDuration={0.26}
      stagger={0.025}
      className="aspect-square w-full max-w-[220px]"
    >
      <div className="flex aspect-square w-full items-center justify-center">
        <div className="text-center">
          <p className="text-base font-medium tracking-tight">Center out</p>
          <p className="mt-1 text-xs text-muted-foreground">Radiates outward.</p>
        </div>
      </div>
    </GridReveal>
  );
}

export function LoopDemo() {
  return (
    <GridReveal
      rows={6}
      cols={6}
      color="#34D399"
      pattern="random"
      blockDuration={0.3}
      stagger={0.03}
      loop
      loopDelay={0.8}
      className="aspect-square w-full max-w-[220px]"
    >
      <div className="flex aspect-square w-full items-center justify-center">
        <div className="text-center">
          <p className="text-base font-medium tracking-tight">Looping</p>
          <p className="mt-1 text-xs text-muted-foreground">Covers and reveals.</p>
        </div>
      </div>
    </GridReveal>
  );
}