export const dynamic = "force-dynamic";

export default async function AccessPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="flex min-h-dvh items-center justify-center bg-black px-5 text-white">
      <div className="w-full max-w-sm space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clover UI</h1>
          <p className="mt-2 text-sm text-white/60">
            This project is private for now. Enter the access password to continue.
          </p>
        </div>
        <form action="/api/access" method="post" className="space-y-4">
          <label htmlFor="password" className="block text-sm text-white/80">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="h-11 w-full rounded-lg border border-white/20 bg-white/5 px-3 outline-none focus:border-white/60"
          />
          {error && <p role="alert" className="text-sm text-red-400">Incorrect password.</p>}
          <button type="submit" className="h-11 w-full rounded-lg bg-white font-medium text-black">
            Unlock project
          </button>
        </form>
      </div>
    </main>
  );
}
