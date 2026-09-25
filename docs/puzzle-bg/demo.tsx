import { PuzzleBg } from "@/registry/clover-ui/puzzle-bg";

export function Demo() {
  return (
    <PuzzleBg
      image="/aurora.gif"
      rows={3}
      cols={4}
      loop
      className="aspect-video w-full max-w-[360px] rounded-2xl"
    />
  );
}
