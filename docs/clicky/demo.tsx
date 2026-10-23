import { Clicky } from "@/registry/clover-ui/clicky";

export function Demo() {
  return (
    <div className="flex min-h-[220px] items-center justify-center">
      <Clicky>
        <span className="text-xl font-semibold tracking-tight sm:text-3xl">Click here</span>
      </Clicky>
    </div>
  );
}
