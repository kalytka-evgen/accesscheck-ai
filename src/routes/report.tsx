import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

type Severity = "critical" | "serious" | "moderate" | "minor";
type Grade = "A" | "B" | "C" | "D" | "F";
type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

interface IssueExample {
  selector: string;
  html: string;
  failureSummary: string;
}

interface Issue {
  id: string;
  description: string;
  impact: Severity;
  count: number;
  wcag: string[];
  examples: IssueExample[];
  has_screenshot?: boolean;
}

interface ReportData {
  url: string;
  score: number;
  grade: Grade;
  risk_level: RiskLevel;
  risk_summary: string;
  benchmark: {
    your_critical: number;
    avg_critical: number;
    percentile_vs_peers: string;
  };
  by_severity: Record<Severity, number>;
  top_issues: Issue[];
  screenshots: Record<string, string[]>;
}

export const Route = createFileRoute("/report")({
  validateSearch: (s: Record<string, unknown>) => ({
    url: typeof s.url === "string" ? s.url : "https://example.com",
    data: typeof s.data === "string" ? s.data : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Accessibility audit report — AccessCheck" },
      { name: "description", content: "WCAG 2.2 accessibility audit report — Layer 1 preview" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Report,
});

const GRADE_COLOR: Record<Grade, string> = {
  A: "var(--grade-a)",
  B: "var(--grade-b)",
  C: "var(--grade-c)",
  D: "var(--grade-d)",
  F: "var(--grade-f)",
};

const SEV_COLOR: Record<Severity, string> = {
  critical: "var(--sev-critical)",
  serious: "var(--sev-serious)",
  moderate: "var(--sev-moderate)",
  minor: "var(--sev-minor)",
};

const RISK_STYLE: Record<RiskLevel, { bg: string; fg: string }> = {
  LOW: { bg: "#16a34a", fg: "#fff" },
  MODERATE: { bg: "#ea580c", fg: "#fff" },
  HIGH: { bg: "#dc2626", fg: "#fff" },
  CRITICAL: { bg: "#18181b", fg: "#fff" },
};

function parseData(raw: string | undefined): ReportData | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as ReportData;
  } catch {
    return null;
  }
}

function Report() {
  const { url, data } = Route.useSearch();
  const report = parseData(data);

  if (!report) {
    return (
      <main className="min-h-screen bg-[#f7f8fa] flex items-center justify-center px-6 py-16">
        <div className="max-w-md w-full bg-card border border-border rounded-lg p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold tracking-tight">No report data</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            We couldn't load this report. Please run a new scan.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center h-11 px-6 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
          >
            Back to scan
          </Link>
        </div>
      </main>
    );
  }

  const reportId = "A8F3";
  const date = new Date().toISOString().slice(0, 10);
  const gradeColor = GRADE_COLOR[report.grade] ?? GRADE_COLOR.F;
  const risk = RISK_STYLE[report.risk_level] ?? RISK_STYLE.HIGH;
  const totalViolations =
    report.by_severity.critical +
    report.by_severity.serious +
    report.by_severity.moderate +
    report.by_severity.minor;

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-foreground py-10 px-4 sm:px-6">
      <article className="max-w-3xl mx-auto bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        {/* Header */}
        <header className="px-6 sm:px-10 pt-8 pb-6 border-b border-border">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Link to="/" className="text-sm font-bold tracking-tight">
              AccessCheck
            </Link>
            <span className="text-xs font-mono text-muted-foreground">
              Report #{reportId} · {date} · Automated L1
            </span>
          </div>
          <h1 className="mt-6 text-2xl sm:text-3xl font-bold tracking-tight">
            WCAG 2.2 Accessibility Audit
          </h1>
          <p className="mt-2 font-mono text-sm text-muted-foreground break-all">
            {report.url || url}
          </p>
        </header>

        {/* Summary */}
        <section className="px-6 sm:px-10 py-8 border-b border-border">
          <div className="flex items-start gap-6 flex-wrap">
            <div className="shrink-0 flex flex-col items-center">
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center text-5xl font-extrabold"
                style={{
                  color: gradeColor,
                  background: `color-mix(in oklab, ${gradeColor} 12%, transparent)`,
                  border: `2px solid ${gradeColor}`,
                }}
                aria-label={`Grade ${report.grade}`}
              >
                {report.grade}
              </div>
              <p className="mt-2 text-[10px] font-mono text-muted-foreground text-center max-w-[7rem] leading-tight">
                A = Excellent · B = Good · C = Average · D = Needs work · F = Critical
              </p>
            </div>
            <div className="flex-1 min-w-[240px]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  EAA Risk
                </span>
                <span
                  className="px-2 py-0.5 text-xs font-bold rounded"
                  style={{ background: risk.bg, color: risk.fg }}
                >
                  {report.risk_level}
                </span>
              </div>
              <p className="mt-3 text-lg font-semibold leading-snug">
                {totalViolations} violations · {report.by_severity.critical} critical.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{report.risk_summary}</p>

              <div className="mt-5 grid grid-cols-4 gap-2 text-center">
                {(["critical", "serious", "moderate", "minor"] as Severity[]).map((s) => (
                  <div key={s} className="border border-border rounded-md py-2">
                    <div className="text-xl font-bold" style={{ color: SEV_COLOR[s] }}>
                      {report.by_severity[s]}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                      {s}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Benchmark */}
        <section className="px-6 sm:px-10 py-6 border-b border-border bg-muted/30">
          <h2 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Benchmark comparison
          </h2>
          <p className="mt-2 text-sm leading-relaxed">
            Your site:{" "}
            <span className="font-semibold">{report.benchmark.your_critical} critical</span>{" "}
            vs industry average:{" "}
            <span className="font-semibold">{report.benchmark.avg_critical} critical</span>.{" "}
            <span className="text-muted-foreground">
              {report.benchmark.percentile_vs_peers}.
            </span>
          </p>
        </section>

        {/* Violations */}
        <section className="px-6 sm:px-10 py-8 border-b border-border">
          <h2 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">
            Violations found
          </h2>
          <ul className="divide-y divide-border border border-border rounded-md">
            {report.top_issues.map((issue) => (
              <IssueRow
                key={issue.id}
                issue={issue}
                screenshots={report.screenshots?.[issue.id] ?? []}
              />
            ))}
          </ul>
        </section>

        {/* Locked preview */}
        <section className="relative px-6 sm:px-10 py-8 border-b border-border">
          <div className="select-none pointer-events-none blur-[6px] opacity-60 space-y-5">
            <div>
              <h2 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                Fix instructions (technical spec)
              </h2>
              <ul className="text-sm space-y-1.5">
                <li>
                  Add <code className="font-mono">alt="Product photo"</code> to{" "}
                  <code className="font-mono">&lt;img&gt;</code> on{" "}
                  <code className="font-mono">.product-card</code>
                </li>
                <li>
                  Increase <code className="font-mono">.price</code> color from{" "}
                  <code className="font-mono">#999</code> to{" "}
                  <code className="font-mono">#595959</code> for 4.5:1 contrast ratio
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                Priority roadmap
              </h2>
              <ul className="text-sm space-y-1.5">
                <li>Phase 1 (7 days): 8 critical fixes — 4.0h</li>
                <li>Phase 2 (30 days): 7 serious — 2.1h</li>
                <li>Phase 3 (90 days): 10 moderate — 2.0h</li>
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                Compliance timeline · Principle breakdown
              </h2>
              <p className="text-sm">
                Perceivable: 8 issues · Operable: 5 · Understandable: 3 · Robust: 2
              </p>
            </div>
          </div>
        </section>

        {/* Upsell */}
        <CheckoutBand url={report.url || url} />

        <footer className="px-6 sm:px-10 py-6 text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Disclaimer.</strong> Automated tool, not legal
          certification. ~80% WCAG coverage. Manual review recommended for complete
          compliance assessment. Reference: EAA 2019/882, EN 301 549.
        </footer>
      </article>
    </main>
  );
}

function CheckoutBand({ url }: { url: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, email: email.trim() }),
      });
      if (!res.ok) throw new Error(`Checkout failed (${res.status})`);
      const session = await res.json();
      if (!session?.url) throw new Error("No checkout URL returned");
      window.location.href = session.url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Checkout failed.";
      setError(msg);
      alert(msg);
      setLoading(false);
    }
  };

  return (
    <section className="px-6 sm:px-10 py-10 bg-[#0d1117] text-[#e6edf3]">
      <p className="text-xs font-mono uppercase tracking-wider text-[#8b949e]">
        This is Layer 1 of 5
      </p>
      <h2 className="mt-3 text-2xl font-bold tracking-tight">Unlock the full audit</h2>
      <ul className="mt-5 space-y-2 text-sm">
        {[
          "AI Vision analysis (GPT-4o)",
          "Agent simulation across user flows",
          "Accessibility tree inspection",
          "Content & language analysis",
          "Developer fix instructions with code",
          "PDF report · Priority roadmap · Industry benchmarks",
        ].map((f) => (
          <li key={f} className="flex gap-2.5">
            <span style={{ color: "var(--primary)" }}>+</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <form onSubmit={handleCheckout} className="mt-7 flex flex-col sm:flex-row gap-3 max-w-lg">
        <input
          type="email"
          required
          disabled={loading}
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 h-12 px-4 rounded-md bg-[#161b22] border border-[#30363d] text-[#e6edf3] placeholder:text-[#6e7681] text-sm outline-none focus:border-[#8b949e] transition disabled:opacity-60"
          aria-label="Email for report delivery"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-12 px-6 rounded-md bg-[#16a34a] text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition shrink-0 inline-flex items-center justify-center gap-2"
        >
          {loading && (
            <span
              className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
              aria-hidden
            />
          )}
          {loading ? "Redirecting…" : "Get Full Report — €49"}
        </button>
      </form>

      {error && (
        <p className="mt-3 text-xs" style={{ color: "#fca5a5" }}>
          {error}
        </p>
      )}

      <p className="mt-3 text-xs text-[#8b949e]">
        5-layer · PDF · Fixes with code · ~2 minutes · Report sent to your email
      </p>
    </section>
  );
}

function IssueRow({ issue, screenshots }: { issue: Issue; screenshots: string[] }) {
  const [open, setOpen] = useState(false);
  const sevColor = SEV_COLOR[issue.impact];
  return (
    <li>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 px-4 py-4 text-left hover:bg-muted/60 transition"
        aria-expanded={open}
      >
        <span
          className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shrink-0"
          style={{
            background: `color-mix(in oklab, ${sevColor} 14%, transparent)`,
            color: sevColor,
          }}
        >
          {issue.impact}
        </span>
        <span className="flex-1 text-sm font-medium">{issue.description}</span>
        <span className="text-xs font-mono text-muted-foreground shrink-0">
          {issue.count}×
        </span>
        <span className="text-muted-foreground text-xs shrink-0">{open ? "▴" : "▾"}</span>
      </button>
      {open && (
        <div className="px-4 pb-5 space-y-3 bg-muted/40">
          {issue.examples.map((ex, i) => (
            <div key={i} className="space-y-2">
              <p className="text-xs font-mono text-muted-foreground">📍 {ex.selector}</p>
              <pre className="text-xs bg-[#1a1a2e] text-[#e6edf3] p-3 rounded overflow-x-auto">
                <code>{ex.html}</code>
              </pre>
              <p className="text-xs">
                <span className="font-semibold">Fix:</span> {ex.failureSummary}
              </p>
            </div>
          ))}
          {issue.has_screenshot && screenshots.length > 0 && (
            <div className="space-y-2">
              {screenshots.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  loading="lazy"
                  alt={`Screenshot of ${issue.description}`}
                  className="max-w-full rounded border border-border"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              ))}
            </div>
          )}
          <p className="text-[11px] font-mono text-muted-foreground">
            {issue.wcag.join(" · ")}
          </p>
        </div>
      )}
    </li>
  );
}
