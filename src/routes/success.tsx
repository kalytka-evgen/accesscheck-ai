import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/success")({
  validateSearch: (s: Record<string, unknown>) => ({
    url: typeof s.url === "string" ? s.url : "",
  }),
  head: () => ({
    meta: [
      { title: "Payment successful — AccessCheck" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Success,
});

function Success() {
  const { url } = Route.useSearch();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const run = async () => {
      try {
        const res = await fetch(`/api/success-scan?url=${encodeURIComponent(url)}`);
        if (!res.ok) throw new Error(`Scan failed (${res.status})`);
        await res.json().catch(() => null);
        setDone(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Scan failed.");
        setDone(true);
      }
    };
    run();
  }, [url]);

  return (
    <main className="min-h-screen bg-[#f7f8fa] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md bg-card border border-border rounded-lg p-10 text-center shadow-sm">
        <div
          className="w-14 h-14 rounded-full mx-auto flex items-center justify-center text-2xl"
          style={{
            background: "color-mix(in oklab, var(--primary) 14%, transparent)",
            color: "var(--primary)",
          }}
          aria-hidden
        >
          ✓
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight">Payment successful</h1>

        {!done ? (
          <>
            <p className="mt-3 text-sm text-muted-foreground">
              Running full 5-layer analysis
              {url && (
                <>
                  {" "}on <span className="font-mono text-foreground break-all">{url}</span>
                </>
              )}
              …
            </p>
            <div className="mt-8">
              <div
                className="w-8 h-8 mx-auto rounded-full border-2 border-border animate-spin"
                style={{ borderTopColor: "var(--primary)" }}
                role="status"
                aria-label="Scanning"
              />
            </div>
          </>
        ) : error ? (
          <>
            <p className="mt-3 text-sm" style={{ color: "var(--risk-high)" }}>
              {error}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Your payment was received. Our team will email your report shortly.
            </p>
            <Link
              to="/"
              className="mt-8 inline-flex items-center justify-center h-11 px-6 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
            >
              Scan another site
            </Link>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm text-muted-foreground">
              Report sent to your email! Check your inbox for the PDF.
            </p>
            <Link
              to="/"
              className="mt-8 inline-flex items-center justify-center h-11 px-6 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
            >
              Scan another site
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
