import { TextGif } from "@/registry/clover-ui/text-gif";

const gifs = {
  seal: "/seal.gif",
  fire: "/fire.gif",
  aurora: "/aurora.gif",
  ocean: "/ocean.gif",
  prism: "/prism.gif",
};

export function Demo() {
  return (
    <div className="flex min-h-[260px] items-center justify-center px-6">
      <TextGif
        src={gifs.fire}
        className="text-center text-6xl font-black tracking-[-0.05em] sm:text-7xl"
      >
        CLOVER
      </TextGif>
    </div>
  );
}

export function FireDemo() {
  return (
    <div className="flex min-h-[220px] items-center justify-center px-6">
      <TextGif
        src={gifs.fire}
        className="text-5xl font-black uppercase tracking-[-0.04em] sm:text-6xl"
      >
        Ship Fast
      </TextGif>
    </div>
  );
}

export function AuroraDemo() {
  return (
    <div className="flex min-h-[220px] items-center justify-center px-6">
      <TextGif
        src={gifs.aurora}
        className="text-center text-5xl font-black tracking-tight"
      >
        Soft motion.
      </TextGif>
    </div>
  );
}

export function OceanDemo() {
  return (
    <div className="flex min-h-[200px] items-center justify-center px-6">
      <TextGif
        src={gifs.ocean}
        className="text-4xl font-bold tracking-tight sm:text-5xl"
      >
        Deep blue.
      </TextGif>
    </div>
  );
}

export function PrismDemo() {
  return (
    <div className="flex min-h-[220px] items-center justify-center px-6">
      <TextGif
        src={gifs.prism}
        className="text-center text-5xl font-black uppercase tracking-[-0.04em]"
      >
        Make it move.
      </TextGif>
    </div>
  );
}

export function SealDemo() {
  return (
    <div className="flex min-h-[200px] items-center justify-center px-6">
      <TextGif
        src={gifs.seal}
        className="text-4xl font-black tracking-tight"
      >
        Animated type
      </TextGif>
    </div>
  );
}

export function ParagraphDemo() {
  return (
    <div className="flex min-h-[260px] items-center justify-center px-6">
      <TextGif
        src={gifs.aurora}
        className="max-w-2xl text-center text-lg font-semibold leading-relaxed tracking-tight sm:text-xl"
      >
        Motion can live inside normal text too, wrapping naturally across multiple lines.
      </TextGif>
    </div>
  );
}
