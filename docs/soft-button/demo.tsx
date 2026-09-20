import { SoftButton } from "@/registry/clover-ui/soft-button";

export function Demo() {
  return <SoftButton color="red">Continue</SoftButton>;
}

export function ColorsDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <SoftButton color="purple">Lime</SoftButton>
    </div>
  );
}

export function SizesDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <SoftButton color="darkRed" size="default">Default</SoftButton>
    </div>
  );
}
