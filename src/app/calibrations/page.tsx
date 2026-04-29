import { CALIBRATIONS } from "@/content/calibrations";

export const metadata = {
  title: "Calibrations — 4/10 next to 9/10",
  description:
    "Four paired interview answers — the same question, two responses. Internalize the gap between a rejection-grade answer and an offer-grade answer.",
};

export default function CalibrationsPage() {
  return (
    <>
      <section className="container-prose pt-16 pb-10">
        <p className="eyebrow mb-4">Calibrations</p>
        <h1 className="font-display text-4xl md:text-6xl tracking-tight text-[color:var(--color-ink)] max-w-[20ch]">
          The same question. <span className="font-display-italic text-[color:var(--color-accent)]">Two&nbsp;answers.</span>
        </h1>
        <p className="mt-6 max-w-[60ch] text-lg text-[color:var(--color-ink-2)]">
          Most first attempts score 4&ndash;6 out of 10. These pairs train your internal scoring.
          Read both. Then read each annotation. Then write down what your version is missing.
        </p>
      </section>

      <section className="container-prose hairline-t pt-10 pb-20">
        {CALIBRATIONS.map((c, i) => (
          <article
            key={c.id}
            id={c.id}
            className={`py-14 ${i === 0 ? "" : "hairline-t"} scroll-mt-24`}
          >
            <header className="mb-8">
              <p className="eyebrow mb-2">Calibration № {String(i + 1).padStart(2, "0")}</p>
              <h2 className="font-display text-3xl md:text-4xl tracking-tight text-[color:var(--color-ink)]">
                {c.question}
              </h2>
              {c.context && (
                <p className="mt-3 max-w-[70ch] text-[color:var(--color-ink-3)]">{c.context}</p>
              )}
            </header>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Weak */}
              <article className="hairline rounded-xl p-6 md:p-7 bg-[color:var(--color-paper-2)]">
                <header className="flex items-baseline justify-between mb-4">
                  <p className="eyebrow">Rejection-grade</p>
                  <p className="font-display nums-tabular text-3xl text-[color:var(--color-danger)]">
                    {c.weak.score}
                  </p>
                </header>
                <blockquote className="font-display-italic text-[color:var(--color-ink-2)] text-lg leading-relaxed whitespace-pre-line">
                  &ldquo;{c.weak.response}&rdquo;
                </blockquote>
                <div className="mt-6 hairline-t pt-5">
                  <p className="eyebrow mb-2">Why it fails</p>
                  <ul className="dash-list text-sm text-[color:var(--color-ink-2)] space-y-1.5">
                    {c.weak.flaws.map((f) => <li key={f}>{f}</li>)}
                  </ul>
                </div>
              </article>

              {/* Strong */}
              <article className="hairline rounded-xl p-6 md:p-7 bg-[color:var(--color-paper)]">
                <header className="flex items-baseline justify-between mb-4">
                  <p className="eyebrow text-[color:var(--color-accent)]">Offer-grade</p>
                  <p className="font-display nums-tabular text-3xl text-[color:var(--color-accent)]">
                    {c.strong.score}
                  </p>
                </header>
                <blockquote className="font-display-italic text-[color:var(--color-ink)] text-lg leading-relaxed whitespace-pre-line">
                  &ldquo;{c.strong.response}&rdquo;
                </blockquote>
                <div className="mt-6 hairline-t pt-5">
                  <p className="eyebrow mb-2">Why it works</p>
                  <ul className="dash-list text-sm text-[color:var(--color-ink-2)] space-y-1.5">
                    {c.strong.strengths.map((s) => <li key={s}>{s}</li>)}
                  </ul>
                </div>
              </article>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
