import { Clicky } from "@/registry/clover-ui/clicky";
import { SoftButton } from "@/registry/clover-ui/soft-button";

export function Demo() {
  return (
    <div className="flex min-h-[220px] items-center justify-center">
      <Clicky>
        <SoftButton color="purple">Get started</SoftButton>
      </Clicky>
    </div>
  );
}
