export default function Loading() {
  return (
    <div className="flex-1 space-y-6 p-6 sm:p-12" aria-busy="true">
      <div className="h-8 w-56 animate-pulse rounded-md bg-white/5" />
      <div className="min-h-[28rem] animate-pulse rounded-lg border border-border bg-white/[0.03]" />
      <div className="h-6 w-40 animate-pulse rounded-md bg-white/5" />
      <div className="h-24 animate-pulse rounded-lg border border-border bg-white/[0.03]" />
    </div>
  );
}
