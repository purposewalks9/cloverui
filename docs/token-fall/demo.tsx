import { TokenFall } from "@/registry/clover-ui/token-fall";

export function Demo() {
  return (
    <div className="relative h-72 w-full max-w-md overflow-hidden rounded-2xl">
      <TokenFall count={34} minSize={12} maxSize={25} />
    </div>
  );
}
