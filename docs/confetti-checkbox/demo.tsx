import { ConfettiCheckbox } from "@/registry/clover-ui/confetti-checkbox";

export function Demo() {
  return (
    <div className="flex items-center gap-20 p-10">
      <ConfettiCheckbox size="lg" aria-label="First option" />
      <ConfettiCheckbox size="lg" aria-label="Second option" defaultChecked />
    </div>
  );
}
