import { SpotlightText } from "@/registry/clover-ui/spotlight-text";

export function Demo() {
  return (
    <p className="text-center text-3xl font-semibold tracking-tight">
      <SpotlightText items={["brands", "interfaces", "experiences", "products"]} color="blue" />
    </p>
  );
}
