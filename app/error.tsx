"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-md rounded-3xl border border-gold/25 bg-paper p-6">
      <h1 className="font-display text-3xl text-forest">Something went wrong</h1>
      <p className="mt-3 text-sm leading-relaxed text-forest/80">
        If you opened a <code>devtools://</code> link, close it. The app is at{" "}
        <a className="underline" href="http://localhost:3000">
          http://localhost:3000
        </a>
        . Most local failures mean Postgres is not connected — add a Neon{" "}
        <code>DATABASE_URL</code> to <code>.env.local</code>, then run{" "}
        <code>npm run db:push</code> and <code>npm run dev</code>.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-5 rounded-full bg-forest px-5 py-2.5 text-sm text-cream"
      >
        Try again
      </button>
    </div>
  );
}
