import { CursorTag } from "@/registry/clover-ui/cursor-tag";

export function Demo() {
  return (
    <div className="relative flex min-h-[320px] w-full items-center justify-center overflow-hidden px-6">
      <div className="relative">
        <p className="text-5xl font-medium tracking-tight sm:text-6xl">Introducing</p>
        <CursorTag label="Dhruv A" color="#7c3aed" className="absolute -top-8 left-[18%]" />
        <CursorTag label="Zaria Z" color="#db2777" className="absolute -bottom-10 left-[40%]" />
        <CursorTag
          label="Marcus L"
          color="#16a34a"
          side="left"
          className="absolute -top-2 -right-16"
        />
      </div>
    </div>
  );
}
