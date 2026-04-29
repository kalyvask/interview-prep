import Link from "next/link";
import { THREE_LAWS, FIVE_SHIFTS, SEVEN_ROUNDS } from "@/content/laws";

export default function HomePage() {
  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <section className="container-prose pt-16 pb-20 md:pt-24 md:pb-28">
        <p className="eyebrow mb-6">For AI PM rounds at OpenAI, Anthropic, Google, Meta, Amazon</p>

        <h1 className="font-display text-[44px] sm:text-[64px] md:text-[88px] leading-[0.96] tracking-[-0.025em] text-[color:var(--color-ink)] max-w-[16ch]">
          The interview prep <span className="font-display-italic text-[color:var(--color-accent)]">that doesn&rsquo;t&nbsp;flatter you.</span>
        </h1>

        <p className="mt-8 max-w-[58ch] text-lg md:text-xl text-[color:var(--color-ink-2)] leading-[1.55]">
          Aakash Gupta&rsquo;s rubric &mdash; calibrated against 200+ candidates and 30+ AI PM offers
          &mdash; turned into a living reference. Seven rounds, the DASME framework, sixty-four
          system-design questions, and the calibration answers that separate a&nbsp;4 from a&nbsp;9.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href="/questions"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[color:var(--color-ink)] text-[color:var(--color-paper)] text-[15px] font-medium ease-standard transition-colors hover:bg-[color:var(--color-accent-2)]"
          >
            Open the question bank
            <span aria-hidden>&rarr;</span>
          </Link>
          <Link
            href="/frameworks"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full hairline text-[15px] font-medium text-[color:var(--color-ink)] ease-standard transition-colors hover:bg-[color:var(--color-paper-2)]"
          >
            Frameworks (DASME / SIGNAL)
          </Link>
        </div>

        {/* Stat strip */}
        <dl className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-8 hairline-t pt-8">
          {[
            ["7",  "interview rounds covered"],
            ["64", "system-design questions"],
            ["8",  "company playbooks"],
            ["4",  "paired calibration answers"],
          ].map(([n, label]) => (
            <div key={label} className="flex flex-col">
              <dt className="font-display nums-tabular text-4xl md:text-5xl text-[color:var(--color-ink)]">{n}</dt>
              <dd className="mt-1 text-sm text-[color:var(--color-ink-3)]">{label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ─── The Three Laws ───────────────────────────────────────────── */}
      <section className="container-prose py-16 md:py-24 hairline-t">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-4">
            <p className="eyebrow mb-3">Section 01</p>
            <h2 className="font-display text-3xl md:text-5xl tracking-tight text-[color:var(--color-ink)]">
              The three laws<br />of every behavioral answer.
            </h2>
            <p className="mt-5 text-[color:var(--color-ink-2)]">
              Over 500 mock interviews, three rules predict offers more reliably than any rubric
              dimension. Memorize them; check every answer against them.
            </p>
          </div>

          <ol className="col-span-12 md:col-span-8 grid gap-4">
            {THREE_LAWS.map((l) => (
              <li
                key={l.number}
                className="hairline rounded-xl p-6 md:p-7 bg-[color:var(--color-paper-2)]"
              >
                <div className="flex items-baseline gap-4">
                  <span className="font-display nums-tabular text-3xl text-[color:var(--color-accent)]">
                    {String(l.number).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-xl md:text-2xl tracking-tight text-[color:var(--color-ink)]">
                    {l.title}
                  </h3>
                </div>
                <p className="mt-2 ml-12 text-[color:var(--color-ink-2)]">{l.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ─── Seven Rounds ─────────────────────────────────────────────── */}
      <section className="container-prose py-16 md:py-24 hairline-t">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <p className="eyebrow mb-3">Section 02</p>
            <h2 className="font-display text-3xl md:text-5xl tracking-tight text-[color:var(--color-ink)]">
              The seven rounds.
            </h2>
          </div>
          <p className="max-w-md text-[color:var(--color-ink-2)]">
            Each row routes to a different rubric. AI System Design and Vibe Coding didn&rsquo;t exist 18 months ago. Both now decide outcomes.
          </p>
        </div>

        <div className="hairline-t">
          {SEVEN_ROUNDS.map((r, i) => (
            <div
              key={r.id}
              className={`grid grid-cols-12 gap-4 py-5 hairline-b items-baseline ${i === 0 ? "" : ""}`}
            >
              <div className="col-span-1 nums-tabular text-sm text-[color:var(--color-ink-4)]">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="col-span-11 sm:col-span-3">
                <h3 className="font-display text-xl tracking-tight text-[color:var(--color-ink)]">{r.label}</h3>
              </div>
              <div className="col-span-12 sm:col-span-5 text-[color:var(--color-ink-2)]">{r.tested}</div>
              <div className="col-span-12 sm:col-span-3 text-sm text-[color:var(--color-ink-3)]">{r.rubric}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── The Five Shifts ──────────────────────────────────────────── */}
      <section className="container-prose py-16 md:py-24 hairline-t">
        <p className="eyebrow mb-3">Section 03</p>
        <h2 className="font-display text-3xl md:text-5xl tracking-tight text-[color:var(--color-ink)] max-w-[18ch]">
          What&rsquo;s actually changed in 2026.
        </h2>

        <ol className="mt-12 grid gap-y-2 sm:gap-y-0">
          {FIVE_SHIFTS.map((s, i) => (
            <li key={s.title} className="grid grid-cols-12 gap-x-6 py-6 hairline-b items-baseline">
              <span className="col-span-1 font-display nums-tabular text-2xl text-[color:var(--color-accent)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="col-span-12 sm:col-span-5 font-display text-xl md:text-2xl tracking-tight text-[color:var(--color-ink)]">
                {s.title}
              </h3>
              <p className="col-span-12 sm:col-span-6 mt-2 sm:mt-0 text-[color:var(--color-ink-2)]">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ─── Section nav ──────────────────────────────────────────────── */}
      <section className="container-prose py-16 md:py-24 hairline-t">
        <p className="eyebrow mb-3">Where to start</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {[
            { href: "/questions",    title: "Question bank",    body: "64 system-design + product-sense questions, filterable, with a 45-min drill timer." },
            { href: "/frameworks",   title: "Frameworks",       body: "DASME, the SIGNAL metric cascade, the model-selection table, seven anti-patterns." },
            { href: "/companies",    title: "Company playbooks", body: "OpenAI, Anthropic, Google DeepMind, Meta AI, Amazon AGI, Netflix, Apple, Nvidia." },
            { href: "/calibrations", title: "Calibrations",     body: "Four paired answers — 4/10 next to 9/10 — to internalize the gap." },
          ].map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group hairline rounded-xl p-7 bg-[color:var(--color-paper)] hover:bg-[color:var(--color-paper-2)] ease-standard transition-colors"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-display text-2xl tracking-tight text-[color:var(--color-ink)]">{c.title}</h3>
                <span className="text-[color:var(--color-accent)] group-hover:translate-x-0.5 ease-standard transition-transform" aria-hidden>&rarr;</span>
              </div>
              <p className="mt-2 text-[color:var(--color-ink-2)]">{c.body}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
