import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

type Severity = "critical" | "serious" | "moderate" | "minor";

interface Issue {
  id: string;
  description: string;
  impact: Severity;
  count: number;
  wcag: string[];
  examples: { selector: string; html: string; failureSummary: string }[];
}

const MOCK = {
  score: 67,
  grade: "D" as const,
  risk_level: "HIGH" as const,
  risk_summary: "8 critical violations. HIGH EAA risk.",
  benchmark: { your_critical: 8, avg_critical: 5, percentile: "Better than 22% of e-commerce sites" },
  by_severity: { critical: 8, serious: 7, moderate: 8, minor: 2 },
  top_issues: [
    {
      id: "color-contrast",
      description: "Text has insufficient color contrast",
      impact: "serious" as Severity,
      count: 12,
      wcag: ["WCAG 2.2 — 1.4.3"],
      examples: [
        {
          selector: ".product-card .price",
          html: '<span class="price">€49.99</span>',
          failureSummary: "Element has contrast of 2.1:1 (needs 4.5:1)",
        },
      ],
    },
    {
      id: "label",
      description: "Form field has no label",
      impact: "serious" as Severity,
      count: 3,
      wcag: ["WCAG 2.2 — 3.3.2"],
      examples: [
        {
          selector: "form#newsletter input[type=email]",
          html: '<input type="email" placeholder="Email" />',
          failureSummary: "Form element does not have an accessible name",
        },
      ],
    },
    {
      id: "link-name",
      description: "Links lack discernible text",
      impact: "moderate" as Severity,
      count: 6,
      wcag: ["WCAG 2.2 — 2.4.4"],
      examples: [
        {
          selector: "footer a.icon",
          html: '<a href="/tw"><svg>…</svg></a>',
          failureSummary: "Link has no accessible name for screen readers",
        },
      ],
    },
    {
      id: "image-alt",
      description: "Images must have alternative text",
      impact: "critical" as Severity,
      count: 4,
      wcag: ["WCAG 2.2 — 1.1.1"],
      examples: [
        {
          selector: ".hero img",
          html: '<img src="/hero.jpg" />',
          failureSummary: "Image element missing alt attribute",
        },
      ],
    },
  ] satisfies Issue[],
};

export const Route = createFileRoute("/report")({
  validateSearch: (s: Record<string, unknown>) => ({
    url: typeof s.url === "string" ? s.url : "https://example.com",
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

const GRADE_COLOR: Record<string, string> = {
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

function Report() {
  const { url } = Route.useSearch();
  const reportId = "A8F3";
  const date = new Date().toISOString().slice(0, 10);
  const gradeColor = GRADE_COLOR[MOCK.grade];

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
          <p className="mt-2 font-mono text-sm text-muted-foreground break-all">{url}</p>
        </header>

        {/* Summary */}
        <section className="px-6 sm:px-10 py-8 border-b border-border">
          <div className="flex items-start gap-6 flex-wrap">
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center text-5xl font-extrabold shrink-0"
              style={{
                color: gradeColor,
                background: `color-mix(in oklab, ${gradeColor} 12%, transparent)`,
                border: `2px solid ${gradeColor}`,
              }}
              aria-label={`Grade ${MOCK.grade}`}
            >
              {MOCK.grade}
            </div>
            <div className="flex-1 min-w-[240px]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  EAA Risk
                </span>
                <span
                  className="px-2 py-0.5 text-xs font-bold rounded"
                  style={{ background: "var(--risk-high)", color: "#fff" }}
                >
                  {MOCK.risk_level}
                </span>
              </div>
              <p className="mt-3 text-lg font-semibold leading-snug">
                {MOCK.by_severity.critical + MOCK.by_severity.serious + MOCK.by_severity.moderate + MOCK.by_severity.minor}{" "}
                violations · {MOCK.by_severity.critical} critical.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{MOCK.benchmark.percentile}.</p>

              <div className="mt-5 grid grid-cols-4 gap-2 text-center">
                {(["critical", "serious", "moderate", "minor"] as Severity[]).map((s) => (
                  <div key={s} className="border border-border rounded-md py-2">
                    <div
                      className="text-xl font-bold"
                      style={{ color: SEV_COLOR[s] }}
                    >
                      {MOCK.by_severity[s]}
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

        {/* Violations */}
        <section className="px-6 sm:px-10 py-8 border-b border-border">
          <h2 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">
            Violations found
          </h2>
          <ul className="divide-y divide-border border border-border rounded-md">
            {MOCK.top_issues.map((issue) => (
              <IssueRow key={issue.id} issue={issue} />
            ))}
          </ul>
        </section>

        {/* Locked preview */}
        <section className="relative px-6 sm:px-10 py-8 border-b border-border">
          <div className="select-none pointer-events-none blur-[6px] opacity-60 space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Fix instructions (technical spec)
            </h2>
            <div className="h-24 bg-muted rounded-md" />
            <h2 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Priority roadmap
            </h2>
            <div className="h-32 bg-muted rounded-md" />
            <h2 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Compliance timeline · Principle breakdown
            </h2>
            <div className="h-20 bg-muted rounded-md" />
          </div>
        </section>

        {/* Upsell */}
        <section className="px-6 sm:px-10 py-10 bg-[#0d1117] text-[#e6edf3]">
          <p className="text-xs font-mono uppercase tracking-wider text-[#8b949e]">
            This is Layer 1 of 5
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight">
            Unlock the full audit
          </h2>
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
          <Link
            to="/success"
            search={{ url }}
            className="mt-7 inline-flex items-center justify-center h-12 px-7 rounded-md bg-[#16a34a] text-white font-semibold hover:opacity-90 transition"
          >
            Get Full Report — €49
          </Link>
          <p className="mt-3 text-xs text-[#8b949e]">
            5-layer · PDF · Fixes with code · ~2 minutes
          </p>
        </section>

        <footer className="px-6 sm:px-10 py-6 text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Disclaimer.</strong> Automated tool, not legal
          certification. ~80% WCAG coverage. Manual review recommended for complete
          compliance assessment. Reference: EAA 2019/882, EN 301 549.
        </footer>
      </article>
    </main>
  );
}

function IssueRow({ issue }: { issue: Issue }) {
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
          style={{ background: `color-mix(in oklab, ${sevColor} 14%, transparent)`, color: sevColor }}
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
          <p className="text-[11px] font-mono text-muted-foreground">
            {issue.wcag.join(" · ")}
          </p>
        </div>
      )}
    </li>
  );
}
