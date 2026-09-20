import { GaugeText } from "@/registry/clover-ui/gauge-text";

export function Demo() {
  return (
    <GaugeText
      value={89}
      suffix="x"
      label="faster"
      color="#E1E900"
      className="text-2xl font-meduim"
    />
  );
}

export function SlowDemo() {
  return (
    <GaugeText
      value={2.4}
      decimals={1}
      suffix="x"
      speed="slow"
      label="slower on cold starts"
      color="#F43F5E"
      className="text-2xl font-meduim"
    />
  );
}

export function FastDemo() {
  return (
    <GaugeText
      value={12}
      suffix="x"
      speed="fast"
      label="faster builds"
      color="#60A5FA"
       className="text-2xl font-meduim"
    />
  );
}

export function NoIconDemo() {
  return (
    <GaugeText
      value={99.9}
      decimals={1}
      suffix="%"
      label="uptime"
      showIcon={false}
      color="#8B5CF6"
      className="text-2xl font-meduim"
    />
  );
}
