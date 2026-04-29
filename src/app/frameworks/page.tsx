import {
  DASME,
  MODEL_SELECTION,
  ANTI_PATTERNS,
  SIGNAL_CASCADE,
  GUARDRAIL_METRICS,
  SAFETY_CHECKLIST,
  VIBE_TOOLS,
  VIBE_LOOP,
} from "@/content/frameworks";
import { EIGHT_DIMENSIONS } from "@/content/laws";

export const metadata = {
  title: "Frameworks — DASME, SIGNAL, model selection, safety",
  description:
    "The DASME system-design framework, the SIGNAL metric cascade, the model-selection table, the seven anti-patterns, the safety-by-design checklist, the vibe-coding loop.",
};

export default function FrameworksPage() {
  return (
    <>
      {/* Hero */}
      <section className="container-prose pt-16 pb-10">
        <p className="eyebrow mb-4">Frameworks</p>
        <h1 className="font-display text-4xl md:text-6xl tracking-tight text-[color:var(--color-ink)] max-w-[20ch]">
          The five tools that decide every&nbsp;round.
        </h1>
        <p className="mt-6 max-w-[60ch] text-lg text-[color:var(--color-ink-2)]">
          DASME for system design. SIGNAL for metrics. The model-selection table for technical
          fluency. The seven anti-patterns to avoid. Safety-by-design for every case. The vibe-coding
          loop for live builds.
        </p>

        <nav className="mt-10 flex flex-wrap gap-2 text-sm">
          {[
            ["#dasme", "DASME"],
            ["#models", "Model selection"],
            ["#anti", "Anti-patterns"],
            ["#signal", "SIGNAL"],
            ["#dimensions", "8 dimensions"],
            ["#safety", "Safety"],
            ["#vibe", "Vibe coding"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="px-3 py-1.5 rounded-full hairline text-[color:var(--color-ink-2)] hover:bg-[color:var(--color-paper-2)] ease-standard"
            >
              {label}
            </a>
          ))}
        </nav>
      </section>

      {/* DASME */}
      <section id="dasme" className="container-prose hairline-t py-16 md:py-20 scroll-mt-24">
        <div className="grid grid-cols-12 gap-8 mb-10">
          <div className="col-span-12 md:col-span-4">
            <p className="eyebrow mb-3">System design</p>
            <h2 className="font-display text-3xl md:text-5xl tracking-tight text-[color:var(--color-ink)]">DASME.</h2>
            <p className="mt-4 text-[color:var(--color-ink-2)]">
              Define · Architect · Specify · Map metrics · Edge cases. Five phases, 45 minutes,
              one diagram. Introduce the plan to the interviewer. Check in between every phase.
            </p>
          </div>
          <div className="col-span-12 md:col-span-8 grid gap-4">
            {DASME.map((p) => (
              <article key={p.letter} className="hairline rounded-xl bg-[color:var(--color-paper-2)] p-6 md:p-7">
                <header className="flex items-baseline gap-4">
                  <span className="font-display text-5xl text-[color:var(--color-accent)] leading-none">{p.letter}</span>
                  <div>
                    <h3 className="font-display text-xl md:text-2xl tracking-tight text-[color:var(--color-ink)]">{p.name}</h3>
                    <p className="text-sm text-[color:var(--color-ink-3)] mt-0.5 nums-tabular">
                      {p.timeShare} · {p.minutes}
                    </p>
                  </div>
                </header>
                <p className="mt-4 text-[color:var(--color-ink-2)]">{p.body}</p>
                {p.prompts.length > 0 && (
                  <ul className="dash-list mt-4 text-sm text-[color:var(--color-ink-3)] space-y-1.5">
                    {p.prompts.map((q, i) => <li key={i}>{q}</li>)}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </div>

        {/* The 4-layer diagram, in ASCII. Always memorable. */}
        <figure className="mt-10 tint-paper rounded-xl p-6 md:p-8 overflow-x-auto">
          <pre className="font-mono text-[12px] md:text-[13px] text-[color:var(--color-ink-2)] leading-[1.55] whitespace-pre">
{`┌──────────────────────────────────────────────────────────────┐
│  INTERACTION   │  Mobile · Web · Voice · API · Slack · Email │
├──────────────────────────────────────────────────────────────┤
│  ORCHESTRATION │  Intent router · State manager · Handoffs   │
├──────────────────────────────────────────────────────────────┤
│  AGENT LAYER   │  Analyst (XGBoost) · Voice (LLM) ·          │
│                │  Executor (rules + ML recommender)          │
├──────────────────────────────────────────────────────────────┤
│  DATA + INFRA  │  Vector DB · Feature store · Policy store · │
│                │  Model registry · Audit log · Memory tiers  │
└──────────────────────────────────────────────────────────────┘`}
          </pre>
          <figcaption className="mt-4 text-sm text-[color:var(--color-ink-3)]">
            The four-layer diagram you must draw within the first 16 minutes. Skip orchestration and
            the interviewer will ask. Single &ldquo;AI&rdquo; box = no hire.
          </figcaption>
        </figure>
      </section>

      {/* Model selection table */}
      <section id="models" className="container-prose hairline-t py-16 md:py-20 scroll-mt-24">
        <p className="eyebrow mb-3">Single most testable knowledge</p>
        <h2 className="font-display text-3xl md:text-5xl tracking-tight text-[color:var(--color-ink)] max-w-[18ch]">
          The model-selection table.
        </h2>
        <p className="mt-4 max-w-[60ch] text-[color:var(--color-ink-2)]">
          Memorize it. The line that scores points every time:{" "}
          <em className="font-display-italic text-[color:var(--color-accent)]">
            we don&rsquo;t always want to use an LLM when a traditional ML model will&nbsp;do.
          </em>
        </p>

        <div className="mt-10 hairline-t">
          {MODEL_SELECTION.map((row, i) => (
            <div
              key={row.task}
              className="grid grid-cols-12 gap-x-6 py-5 hairline-b items-baseline"
            >
              <span className="col-span-1 nums-tabular text-sm text-[color:var(--color-ink-4)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="col-span-12 sm:col-span-4">
                <h3 className="font-display text-lg tracking-tight text-[color:var(--color-ink)]">{row.task}</h3>
              </div>
              <div className="col-span-12 sm:col-span-4 mt-1 sm:mt-0 text-[color:var(--color-ink)] font-medium">
                {row.use}
              </div>
              <div className="col-span-12 sm:col-span-3 mt-1 sm:mt-0 text-sm text-[color:var(--color-ink-3)]">
                {row.why}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Anti-patterns */}
      <section id="anti" className="container-prose hairline-t py-16 md:py-20 scroll-mt-24">
        <p className="eyebrow mb-3">Failure modes</p>
        <h2 className="font-display text-3xl md:text-5xl tracking-tight text-[color:var(--color-ink)] max-w-[20ch]">
          Seven ways candidates fail this round.
        </h2>

        <div className="mt-10 grid sm:grid-cols-2 gap-4">
          {ANTI_PATTERNS.map((a, i) => (
            <article
              key={a.title}
              className="hairline rounded-xl p-6 bg-[color:var(--color-paper)]"
            >
              <p className="eyebrow text-[color:var(--color-accent)] mb-2">№ {String(i + 1).padStart(2, "0")}</p>
              <h3 className="font-display text-xl tracking-tight text-[color:var(--color-ink)]">{a.title}</h3>
              <p className="mt-3 text-sm">
                <span className="text-[color:var(--color-ink-3)] uppercase tracking-wider mr-1.5 text-[10px]">Fail</span>
                <span className="text-[color:var(--color-ink-2)]">{a.fail}</span>
              </p>
              <p className="mt-2 text-sm">
                <span className="text-[color:var(--color-accent)] uppercase tracking-wider mr-1.5 text-[10px]">Fix</span>
                <span className="text-[color:var(--color-ink)]">{a.fix}</span>
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* SIGNAL */}
      <section id="signal" className="container-prose hairline-t py-16 md:py-20 scroll-mt-24">
        <p className="eyebrow mb-3">Metrics</p>
        <h2 className="font-display text-3xl md:text-5xl tracking-tight text-[color:var(--color-ink)] max-w-[24ch]">
          The cascade that connects model quality to&nbsp;dollars.
        </h2>

        <div className="mt-10 grid gap-6">
          {SIGNAL_CASCADE.map((layer, i) => (
            <article key={layer.label} className="hairline rounded-xl bg-[color:var(--color-paper-2)] p-6 md:p-8">
              <header className="flex items-baseline gap-3 mb-4">
                <span className="font-display nums-tabular text-3xl text-[color:var(--color-accent)]">{i + 1}</span>
                <h3 className="font-display text-2xl tracking-tight text-[color:var(--color-ink)]">{layer.label}</h3>
              </header>
              <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
                {layer.examples.map((e) => (
                  <div key={e.kind} className="flex flex-col sm:flex-row gap-1 sm:gap-3 py-1.5 hairline-t pt-3">
                    <dt className="text-sm text-[color:var(--color-ink-3)] sm:w-44">{e.kind}</dt>
                    <dd className="text-sm text-[color:var(--color-ink)]">{e.metrics}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>

        <div className="mt-10 tint-accent rounded-r-md py-5 pl-6 pr-6">
          <p className="eyebrow text-[color:var(--color-accent-ink)] mb-2">The line that scores points</p>
          <p className="text-[color:var(--color-ink-2)] max-w-[70ch]">
            <em className="font-display-italic">
              These metrics cascade. Model quality drives user experience, which drives business
              outcomes. If recall drops from 90% to 85% on churn prediction, we miss 5% more at-risk
              users — at our base of 500K accounts per quarter, that&rsquo;s 2,500 customers at $500
              LTV — $1.25M in preventable churn.
            </em>
          </p>
        </div>

        <h3 className="mt-12 font-display text-2xl tracking-tight">Guardrails — always mention</h3>
        <ul className="dash-list mt-4 text-[color:var(--color-ink-2)] grid sm:grid-cols-2 gap-y-1">
          {GUARDRAIL_METRICS.map((g) => (
            <li key={g.name}>
              <span className="text-[color:var(--color-ink)]">{g.name}</span>{" "}
              <span className="text-[color:var(--color-ink-3)]">— {g.why}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 8 dimensions */}
      <section id="dimensions" className="container-prose hairline-t py-16 md:py-20 scroll-mt-24">
        <p className="eyebrow mb-3">Behavioral rubric</p>
        <h2 className="font-display text-3xl md:text-5xl tracking-tight text-[color:var(--color-ink)] max-w-[20ch]">
          Eight dimensions, scored 1–10.
        </h2>

        <ol className="mt-10 hairline-t">
          {EIGHT_DIMENSIONS.map((d, i) => (
            <li key={d.name} className="grid grid-cols-12 gap-x-6 py-5 hairline-b items-baseline">
              <span className="col-span-2 sm:col-span-1 nums-tabular text-sm text-[color:var(--color-ink-4)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="col-span-10 sm:col-span-4 font-display text-xl tracking-tight text-[color:var(--color-ink)]">
                {d.name}
              </h3>
              <p className="col-span-12 sm:col-span-7 mt-2 sm:mt-0 text-[color:var(--color-ink-2)]">{d.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Safety */}
      <section id="safety" className="container-prose hairline-t py-16 md:py-20 scroll-mt-24">
        <p className="eyebrow mb-3">Safety-by-design</p>
        <h2 className="font-display text-3xl md:text-5xl tracking-tight text-[color:var(--color-ink)] max-w-[18ch]">
          Six questions to answer in every case.
        </h2>
        <p className="mt-4 max-w-[60ch] text-[color:var(--color-ink-2)]">
          Anthropic runs a dedicated safety round. OpenAI embeds it. Google tests it inside
          Googleyness. If you don&rsquo;t weave safety into a case answer proactively — auto-deduction.
        </p>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2">
          {SAFETY_CHECKLIST.map((s, i) => (
            <li key={s.question} className="hairline rounded-xl p-6 bg-[color:var(--color-paper-2)]">
              <p className="eyebrow text-[color:var(--color-accent)] mb-2">{String(i + 1).padStart(2, "0")} · Ask</p>
              <h3 className="font-display text-lg tracking-tight text-[color:var(--color-ink)]">{s.question}</h3>
              <p className="mt-2 text-sm text-[color:var(--color-ink-2)]">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Vibe coding */}
      <section id="vibe" className="container-prose hairline-t py-16 md:py-20 scroll-mt-24">
        <p className="eyebrow mb-3">Vibe coding round</p>
        <h2 className="font-display text-3xl md:text-5xl tracking-tight text-[color:var(--color-ink)] max-w-[22ch]">
          You&rsquo;re not writing code. You&rsquo;re directing a tool.
        </h2>
        <p className="mt-4 max-w-[60ch] text-[color:var(--color-ink-2)]">
          A 30–60 minute live round at Google, Figma, Perplexity, v0, and AI-first startups. They
          test prompt quality, output critique, iteration speed, and product judgment.
        </p>

        <div className="mt-10 grid grid-cols-12 gap-8">
          <ol className="col-span-12 md:col-span-7">
            <p className="eyebrow mb-3">The loop that passes</p>
            {VIBE_LOOP.map((step, i) => (
              <li key={i} className="hairline-b py-4 grid grid-cols-12 gap-4 items-baseline">
                <span className="col-span-1 font-display nums-tabular text-2xl text-[color:var(--color-accent)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="col-span-11 text-[color:var(--color-ink-2)]">{step}</p>
              </li>
            ))}
          </ol>
          <div className="col-span-12 md:col-span-5">
            <p className="eyebrow mb-3">Tool, by best fit</p>
            <ul className="hairline rounded-xl bg-[color:var(--color-paper-2)]">
              {VIBE_TOOLS.map((t, i) => (
                <li key={t.tool} className={`p-5 ${i === 0 ? "" : "hairline-t"}`}>
                  <div className="font-display text-lg text-[color:var(--color-ink)]">{t.tool}</div>
                  <p className="mt-1 text-sm text-[color:var(--color-ink-2)]">{t.bestFor}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
