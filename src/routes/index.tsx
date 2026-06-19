import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AccessCheck — WCAG 2.2 audit before regulators find you" },
      {
        name: "description",
        content:
          "EU Accessibility Act is live. Fines up to €100,000. 5-layer AI scan, ~80% WCAG coverage, results in 20 seconds. Free preview.",
      },
      { property: "og:title", content: "AccessCheck — WCAG 2.2 audit" },
      {
        property: "og:description",
        content: "EU Accessibility Act is live. Scan your site free in 20 seconds.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // Force dark theme on landing
  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => document.documentElement.classList.remove("dark");
  }, []);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;
    setLoading(true);
    const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    setTimeout(() => {
      navigate({ to: "/report", search: { url: normalized } });
    }, 400);
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-2xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight">
            Your site is breaking the law.
            <br />
            <span className="text-muted-foreground">Find out before they do.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
            The EU Accessibility Act is in force. Fines up to{" "}
            <span className="text-foreground font-semibold">€100,000</span>. 96% of sites
            aren't ready. Check yours — free.
          </p>

          <form onSubmit={handleScan} className="mt-10 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              inputMode="url"
              autoComplete="url"
              spellCheck={false}
              required
              placeholder="your-website.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 h-14 px-4 rounded-md bg-[color:var(--input)] border border-border text-foreground placeholder:text-muted-foreground text-base outline-none focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="h-14 px-8 rounded-md bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 disabled:opacity-60 transition shrink-0"
            >
              {loading ? "Scanning…" : "Scan"}
            </button>
          </form>

          <p className="mt-4 text-sm text-muted-foreground">
            5-layer AI analysis · No signup · ~20 seconds
          </p>

          <div className="mt-16 pt-8 border-t border-border">
            <p className="text-xs text-muted-foreground leading-relaxed">
              5-layer AI · ~80% WCAG coverage · Built on axe-core + GPT-4o
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["WCAG 2.2", "EAA 2019/882", "EN 301 549"].map((b) => (
                <span
                  key={b}
                  className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded border border-border text-muted-foreground"
                >
                  {b}
                </span>
              ))}
            </div>
            <p className="mt-6 text-xs text-muted-foreground/70">
              Automated tool · Not legal certification.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
