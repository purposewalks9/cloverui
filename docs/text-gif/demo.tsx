import { TextGif } from "@/registry/clover-ui/text-gif";

export const gifs = {
  seal: "/seal.gif",
  fire: "/fire.gif",
  aurora: "/aurora.gif",
  ocean: "/ocean.gif",
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
