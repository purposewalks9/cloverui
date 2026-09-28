import { Spinner } from "@/registry/clover-ui/spinner";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-1 items-center justify-center" aria-busy="true">
      <Spinner size={24} interactive={false} />
    </div>
  );
}
