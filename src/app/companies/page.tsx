import { COMPANIES } from "@/content/companies";

export const metadata = {
  title: "Company Playbooks — AI PM Interview Prep",
  description:
    "Playbooks for OpenAI, Anthropic, Google DeepMind, Meta AI, Amazon AGI, Netflix, Apple, Nvidia. TC, structure, what they test, red flags, and sample questions from candidate debriefs.",
};

export default function CompaniesPage() {
  return (
    <>
      <section className="container-prose pt-16 pb-10">
        <p className="eyebrow mb-4">Company playbooks</p>
        <h1 className="font-display text-4xl md:text-6xl tracking-tight text-[color:var(--color-ink)] max-w-[20ch]">
          What each loop actually tests.
        </h1>
        <p className="mt-6 max-w-[60ch] text-lg text-[color:var(--color-ink-2)]">
          Distilled from candidate debriefs over the past 12 months. Compensation is median TC.
          Specific questions are what real candidates were asked &mdash; format varies by team and
          level.
        </p>
      </section>

      <section className="container-prose hairline-t pt-10 pb-20">
        {COMPANIES.map((c, i) => (
          <article
            key={c.slug}
            id={c.slug}
            className={`grid grid-cols-12 gap-x-8 gap-y-6 py-12 ${i === 0 ? "" : "hairline-t"} scroll-mt-24`}
          >
            {/* Left rail: name + comp */}
            <header className="col-span-12 md:col-span-4">
              <p className="eyebrow mb-2">№ {String(i + 1).padStart(2, "0")}</p>
              <h2 className="font-display text-3xl md:text-4xl tracking-tight text-[color:var(--color-ink)]">
                {c.name}
              </h2>
              <p className="mt-3 text-[color:var(--color-ink-2)] nums-tabular">{c.tc}</p>
              {c.passRate && (
                <p className="text-sm text-[color:var(--color-ink-3)] nums-tabular">{c.passRate}</p>
              )}
              <p className="mt-4 font-display-italic text-[color:var(--color-accent)] text-lg leading-snug">
                {c.oneLiner}
              </p>
            </header>

            {/* Right rail: structure + what they test + sample questions */}
            <div className="col-span-12 md:col-span-8 space-y-6">
              <div>
                <p className="eyebrow mb-2">Structure</p>
                <p className="text-[color:var(--color-ink-2)]">{c.structure}</p>
              </div>

              <div>
                <p className="eyebrow mb-2">What they test</p>
                <ul className="dash-list space-y-1.5 text-[color:var(--color-ink-2)]">
                  {c.whatTheyTest.map((t, j) => <li key={j}>{t}</li>)}
                </ul>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="tint-paper rounded-md p-4">
                  <p className="eyebrow mb-1.5">Where system thinking shows up</p>
                  <p className="text-sm text-[color:var(--color-ink-2)]">{c.whereSystemThinking}</p>
                </div>
                <div className="tint-accent rounded-md p-4 pl-5">
                  <p className="eyebrow text-[color:var(--color-accent-ink)] mb-1.5">Red flag</p>
                  <p className="text-sm text-[color:var(--color-ink-2)]">{c.redFlag}</p>
                </div>
              </div>

              <div>
                <p className="eyebrow mb-2">Sample questions</p>
                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-[color:var(--color-ink)]">
                  {c.sampleQuestions.map((q) => (
                    <li key={q} className="text-sm border-l border-[color:var(--color-rule-strong)] pl-3">
                      {q}
                    </li>
                  ))}
                </ul>
              </div>

              {c.signatureQuestions && c.signatureQuestions.length > 0 && (
                <div>
                  <p className="eyebrow mb-2">Signature questions</p>
                  <ul className="space-y-2.5 text-[color:var(--color-ink-2)]">
                    {c.signatureQuestions.map((q, j) => (
                      <li key={j} className="text-sm leading-relaxed border-l-2 border-[color:var(--color-accent)] pl-3">
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(c.whatToMention || c.whatToAvoid) && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {c.whatToMention && c.whatToMention.length > 0 && (
                    <div className="tint-paper rounded-md p-4">
                      <p className="eyebrow mb-2">Mention unprompted</p>
                      <ul className="dash-list space-y-1.5 text-sm text-[color:var(--color-ink-2)]">
                        {c.whatToMention.map((t, j) => <li key={j}>{t}</li>)}
                      </ul>
                    </div>
                  )}
                  {c.whatToAvoid && c.whatToAvoid.length > 0 && (
                    <div className="tint-accent rounded-md p-4 pl-5">
                      <p className="eyebrow text-[color:var(--color-accent-ink)] mb-2">Avoid</p>
                      <ul className="dash-list space-y-1.5 text-sm text-[color:var(--color-ink-2)]">
                        {c.whatToAvoid.map((t, j) => <li key={j}>{t}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {c.hiresFor && c.hiresFor.length > 0 && (
                <div>
                  <p className="eyebrow mb-2">Hires for</p>
                  <ul className="dash-list space-y-1.5 text-[color:var(--color-ink-2)]">
                    {c.hiresFor.map((t, j) => <li key={j} className="text-sm">{t}</li>)}
                  </ul>
                </div>
              )}

              {c.sourceNotes && (
                <p className="text-xs text-[color:var(--color-ink-4)] italic pt-2 hairline-t">
                  {c.sourceNotes}
                </p>
              )}
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
