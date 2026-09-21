import { GaugeText } from "@/registry/clover-ui/gauge-text";

export function Demo() {
  return (
    <GaugeText
      value={89}
      suffix="x"
      label="faster"
      color="#E1E900"
      className="text-2xl font-semibold"
    />
  );
}
