import { BlockText } from "@/registry/clover-ui/block-text";

export function Demo() {
  return (
    <div className="flex min-h-[280px] w-full items-center justify-center px-6">
      <BlockText
        words={["Trick", "Treat", "Boo!"]}
        theme="halloween"
        className="text-5xl sm:text-6xl"
      />
    </div>
  );
}
