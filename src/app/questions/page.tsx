import {
  QUESTIONS,
  CATEGORY_NOTES,
  CATEGORY_ORDER,
  STAGE_NOTES,
  STAGE_ORDER,
  STAGE_LABELS,
} from "@/content/questions";
import { QuestionsExplorer } from "./questions-explorer";

export const metadata = {
  title: "Question Bank — AI PM Interview Prep",
  description:
    "114 AI PM interview questions across the seven loop stages — recruiter screen, hiring manager, product sense, execution and metrics, technical / DASME system design, stakeholder / GTM, and behavioral / values. Filterable by stage or by system-design category. 45-minute drill timer for technical questions.",
};

export default function QuestionsPage() {
  const total = QUESTIONS.length;
  return (
    <>
      <section className="container-prose pt-16 pb-10">
        <p className="eyebrow mb-4">The question bank</p>
        <h1 className="font-display text-4xl md:text-6xl tracking-tight text-[color:var(--color-ink)] max-w-[22ch]">
          {total} questions across all seven interview&nbsp;stages.
        </h1>
        <p className="mt-6 max-w-[60ch] text-lg text-[color:var(--color-ink-2)]">
          Recruiter screen, hiring manager, product sense, execution and
          metrics, technical / DASME system design, stakeholder / GTM, and
          behavioral / values. Mined from candidate debriefs across frontier
          AI labs over the past twelve months. Filter by stage to drill the
          round you have coming up; filter by system-design category to drill
          a specific sub-domain. Each technical question has a 45-minute
          timer with DASME phase markers.
        </p>
      </section>

      <QuestionsExplorer
        questions={QUESTIONS}
        categories={CATEGORY_ORDER}
        notes={CATEGORY_NOTES}
        stages={STAGE_ORDER}
        stageNotes={STAGE_NOTES}
        stageLabels={STAGE_LABELS}
      />
    </>
  );
}
