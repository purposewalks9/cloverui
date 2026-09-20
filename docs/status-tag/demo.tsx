import { StatusTag } from "@/registry/clover-ui/status-tag";

export function Demo() {
  return <StatusTag status="completed" />;
}

export function StatusesDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <StatusTag status="draft" />
      <StatusTag status="in-progress" />
      <StatusTag status="in-review" />
      <StatusTag status="completed" />
    </div>
  );
}

export function LabelsDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <StatusTag status="draft" label="Planned" />
      <StatusTag status="completed" label="Shipped" />
    </div>
  );
}
