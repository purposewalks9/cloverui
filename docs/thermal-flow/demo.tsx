import { ThermalFlow } from "@/registry/clover-ui/thermal-flow";

export function Demo() {
  return (
    <div className="relative aspect-video w-full max-w-[420px] overflow-hidden rounded-2xl">
      <ThermalFlow theme="thermal" />
      <div className="relative flex h-full flex-col justify-end bg-gradient-to-t from-black/50 via-transparent to-transparent p-5 text-white">
        <p className="text-xs uppercase tracking-[0.18em] text-white/70">Thermal Flow</p>
        <p className="mt-1 text-lg font-medium tracking-tight">Smooth, rich, GPU-light.</p>
      </div>
    </div>
  );
}
