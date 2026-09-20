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

export function SequentialDemo() {
  return (
    <GridReveal
      rows={8}
      cols={8}
      color="#8B5CF6"
      pattern="sequential"
      blockDuration={0.22}
      stagger={0.012}
      className="aspect-square w-full max-w-[220px]"
    >
      <div className="flex aspect-square w-full items-center justify-center">
        <div className="text-center">
          <p className="text-base font-medium tracking-tight">In order</p>
          <p className="mt-1 text-xs text-muted-foreground">Row by row.</p>
        </div>
      </div>
    </GridReveal>
  );
}

export function DenseDemo() {
  return (
    <GridReveal
      rows={12}
      cols={12}
      color="#60A5FA"
      pattern="random"
      blockDuration={0.2}
      stagger={0.008}
      className="aspect-square w-full max-w-[220px]"
    >
      <div className="flex aspect-square w-full items-center justify-center">
        <div className="text-center">
          <p className="text-base font-medium tracking-tight">Denser grid</p>
          <p className="mt-1 text-xs text-muted-foreground">12 x 12 blocks.</p>
        </div>
      </div>
    </GridReveal>
  );
}

export function SlowDemo() {
  return (
    <GridReveal
      rows={6}
      cols={6}
      color="#F43F5E"
      pattern="random"
      blockDuration={0.5}
      stagger={0.05}
      className="aspect-square w-full max-w-[220px]"
    >
      <div className="flex aspect-square w-full items-center justify-center">
        <div className="text-center">
          <p className="text-base font-medium tracking-tight">Slow reveal</p>
          <p className="mt-1 text-xs text-muted-foreground">Longer stagger.</p>
        </div>
      </div>
    </GridReveal>
  );
}