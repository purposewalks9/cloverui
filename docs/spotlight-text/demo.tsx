import { SpotlightText } from "@/registry/clover-ui/spotlight-text";

export function Demo() {
  return (
    <p className="text-center text-2xl font-semibold tracking-tight">
      I create{" "}
      <SpotlightText items={["brands", "interfaces", "experiences", "products"]} color="blue" />{" "}
      that feel alive.
    </p>
  );
}
