import { StatusFace } from "@/registry/clover-ui/status-face";

export function Demo() {
  return (
    <div className="flex min-h-[320px] w-full flex-col items-center justify-center gap-3 px-6">
      <StatusFace status="great" className="w-full max-w-sm" />
      <StatusFace status="ok" className="w-full max-w-sm" />
      <StatusFace status="attention" className="w-full max-w-sm" />
    </div>
  );
}
