import { PulseLoader } from "@/registry/clover-ui/pulse-loader";

export function Demo() {
  return <PulseLoader />;
}

export function AccentDemo() {
  return <PulseLoader color="#E1E900" size={60} />;
}

export function FastDemo() {
  return <PulseLoader color="#8B5CF6" duration={0.9} stagger={0.08} size={60} />;
}

export function ThreeRingDemo() {
  return <PulseLoader color="#F43F5E" rings={3} size={40} />;
}