import { StatusFace } from "@/registry/clover-ui/status-face";

export function Demo() {
  return (
    <div className="flex min-h-[240px] w-full flex-wrap items-center justify-center gap-5 px-6">
      <StatusFace status="great" className="size-14" />
      <StatusFace status="good" className="size-14" />
      <StatusFace status="ok" className="size-14" />
      <StatusFace status="meh" className="size-14" />
      <StatusFace status="bad" className="size-14" />
    </div>
  );
}
