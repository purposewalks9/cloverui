import { PuzzleReveal } from "@/registry/clover-ui/puzzle-reveal";

export function Demo() {
  return (
    <PuzzleReveal
      rows={4}
      cols={5}
      color="#E1E900"
      pattern="random"
      pieceDuration={0.38}
      stagger={0.055}
      className="aspect-video w-full max-w-[360px] rounded-2xl"
    >
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-neutral-950 text-white">
        <div className="relative h-full w-full">
          <img
            src="/aurora.gif"
            alt="Aurora"
            className="h-full w-full object-cover opacity-70"
          />
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 to-transparent p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">Puzzle Reveal</p>
              <p className="mt-1 text-lg font-medium tracking-tight">Anything can sit underneath.</p>
            </div>
          </div>
        </div>
      </div>
    </PuzzleReveal>
  );
}
