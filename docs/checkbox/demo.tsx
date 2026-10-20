import { Checkbox } from "@/registry/clover-ui/checkbox";

export function Demo() {
  return (
    <div className="flex items-center gap-20 p-10">
      <Checkbox size="lg" aria-label="First option" />
      <Checkbox size="lg" aria-label="Second option" defaultChecked />
    </div>
  );
}
