import { Clicky } from "@/registry/clover-ui/clicky";

export function Demo() {
  return (
    <div className="flex min-h-[220px] items-center justify-center">
      <Clicky>
        <span className="text-3xl font-semibold tracking-tight">Click here</span>
      </Clicky>
    </div>
  );
}
