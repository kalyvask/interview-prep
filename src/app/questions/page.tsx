import { QUESTIONS, CATEGORY_NOTES, CATEGORY_ORDER } from "@/content/questions";
import { QuestionsExplorer } from "./questions-explorer";

export const metadata = {
  title: "Question Bank — AI PM Interview Prep",
  description:
    "64 system-design + product-sense questions mined from candidate debriefs at OpenAI, Anthropic, Google, Meta, Amazon. Filterable, with a 45-min drill timer.",
};

export default function QuestionsPage() {
  return (
    <>
      <section className="container-prose pt-16 pb-10">
        <p className="eyebrow mb-4">The question bank</p>
        <h1 className="font-display text-4xl md:text-6xl tracking-tight text-[color:var(--color-ink)] max-w-[22ch]">
          The full bank. Six categories, plus eight product-sense&nbsp;bonuses.
        </h1>
        <p className="mt-6 max-w-[60ch] text-lg text-[color:var(--color-ink-2)]">
          Sixty-four system-design questions mined from Glassdoor, Exponent, Blind, and candidate
          debriefs from the past 12 months &mdash; plus eight product-sense cases that show up in the
          AI product rounds. Pick a category. Set the 45-minute timer. Draw the DASME diagram in the
          first four minutes. Grade against the rubric.
        </p>
      </section>

      <QuestionsExplorer
        questions={QUESTIONS}
        categories={CATEGORY_ORDER}
        notes={CATEGORY_NOTES}
      />
    </>
  );
}
