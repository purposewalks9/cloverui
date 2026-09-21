import { TokenFall } from "@/registry/clover-ui/token-fall";

export function Demo() {
  return (
    <div className="relative h-72 w-full max-w-md overflow-hidden ">
      <TokenFall count={30} minSize={12} maxSize={24} />
    </div>
  );
}
