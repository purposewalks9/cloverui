import { Butterflies } from "@/registry/clover-ui/butterflies";

export function Demo() {
  return (
    <div className="relative aspect-[4/3] w-full max-w-[420px] overflow-hidden rounded-2xl">
      <Butterflies count={5} size={48} />
    </div>
  );
}
