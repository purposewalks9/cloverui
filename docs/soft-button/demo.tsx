import { ArrowRight, Check, Sparkles, Zap } from "lucide-react";
import { SoftButton } from "@/registry/clover-ui/soft-button";

export function Demo() {
  return (
    <SoftButton color="lime">
      Explore Clover
    </SoftButton>
  );
}

export function ColorsDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <SoftButton color="red">Red</SoftButton>
      <SoftButton color="purple">Purple</SoftButton>
    </div>
  );
}

export function SizesDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center ">
      <SoftButton size="default" color="lime">Default</SoftButton>
    </div>
  );
}

export function ActionsDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <SoftButton color="green">
        <Check />
        Saved
      </SoftButton>
    </div>
  );
}

export function DarkDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center ">
      <SoftButton color="yellow">Login</SoftButton>
    </div>
  );
}
