'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error('Unhandled app error', error);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background text-foreground">
      <div className="max-w-md w-full rounded-2xl border border-border bg-card/60 p-6 text-center space-y-3">
        <h2 className="text-xl font-bold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">
          We hit an unexpected problem. Please retry, or refresh the page.
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

