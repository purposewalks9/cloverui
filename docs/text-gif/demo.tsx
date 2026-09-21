import { TextGif } from "@/registry/clover-ui/text-gif";

export function Demo() {
  return (
    <div className="flex min-h-[260px] items-center justify-center px-6">
      <TextGif
        src="/seal.gif"
        className="text-center text-6xl font-black tracking-tight sm:text-7xl"
      >
        CLOVER
      </TextGif>
    </div>
  );
}

export function SmallDemo() {
  return (
    <div className="flex min-h-[180px] items-center justify-center px-6">
      <TextGif
        src="/seal.gif"
        className="text-4xl font-bold tracking-tight"
      >
        Moving Text
      </TextGif>
    </div>
  );
}

export function CustomDemo() {
  return (
    <div className="flex min-h-[220px] items-center justify-center px-6">
      <TextGif
        src="/seal.gif"
        className="text-5xl font-black uppercase tracking-[-0.04em]"
      >
        Creative Type
      </TextGif>
    </div>
  );
}

export function ParagraphDemo() {
  return (
    <div className="flex min-h-[260px] items-center justify-center px-6">
      <TextGif
        src="/seal.gif"
        className="max-w-2xl text-center text-lg font-semibold leading-relaxed tracking-tight sm:text-xl"
      >
        This is a longer paragraph of text rendered with the animated gif
        clipped behind every character, wrapping naturally across multiple
        lines just like normal body copy would.
      </TextGif>
    </div>
  );
}