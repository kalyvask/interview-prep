"use client";

import type { SessionGrade } from "@/types/session";

interface GradeCardProps {
  grade: SessionGrade;
}

export default function GradeCard({ grade }: GradeCardProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-baseline gap-4">
        <span className="font-display text-6xl nums-tabular text-[color:var(--color-accent)]">
          {grade.score}
        </span>
        <span className="text-[color:var(--color-ink-3)] text-sm">/ 10</span>
        <span className="eyebrow ml-auto">Score</span>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <section>
          <p className="eyebrow mb-2">Strengths</p>
          <ul className="dash-list space-y-2">
            {grade.strengths.map((s, i) => (
              <li key={i} className="text-sm text-[color:var(--color-ink-2)] leading-relaxed">
                {s}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <p className="eyebrow mb-2">Improvements</p>
          <ul className="dash-list space-y-2">
            {grade.improvements.map((s, i) => (
              <li key={i} className="text-sm text-[color:var(--color-ink-2)] leading-relaxed">
                {s}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="tint-accent rounded-2xl p-5">
        <p className="eyebrow mb-2 text-[color:var(--color-accent-ink)]">
          Stronger rephrase
        </p>
        <p className="text-[15px] text-[color:var(--color-accent-ink)] leading-relaxed font-display-italic">
          {grade.strongerRephrase}
        </p>
      </section>
    </div>
  );
}
