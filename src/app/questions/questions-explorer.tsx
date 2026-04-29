"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Question, QuestionCategory, CategoryNote } from "@/content/questions";

type Props = {
  questions: Question[];
  categories: QuestionCategory[];
  notes: CategoryNote[];
};

export function QuestionsExplorer({ questions, categories, notes }: Props) {
  const [activeCategory, setActiveCategory] = useState<QuestionCategory | "All">("All");
  const [drill, setDrill] = useState<Question | null>(null);

  const filtered = useMemo(
    () => (activeCategory === "All" ? questions : questions.filter((q) => q.category === activeCategory)),
    [questions, activeCategory]
  );

  const counts: Record<string, number> = useMemo(() => {
    const out: Record<string, number> = { All: questions.length };
    for (const c of categories) out[c] = questions.filter((q) => q.category === c).length;
    return out;
  }, [questions, categories]);

  const activeNote = notes.find((n) => n.category === activeCategory);

  return (
    <>
      {/* Filter chips */}
      <section className="container-prose hairline-t hairline-b py-5 sticky top-[64px] z-20 bg-[color:var(--color-paper)]/90 backdrop-blur-md">
        <div className="flex flex-wrap gap-2">
          {(["All", ...categories] as Array<QuestionCategory | "All">).map((c) => {
            const active = c === activeCategory;
            return (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-3.5 py-1.5 rounded-full text-sm ease-standard transition-colors hairline ${
                  active
                    ? "bg-[color:var(--color-ink)] text-[color:var(--color-paper)] border-[color:var(--color-ink)]"
                    : "text-[color:var(--color-ink-2)] hover:bg-[color:var(--color-paper-2)]"
                }`}
              >
                {c}
                <span className={`ml-2 nums-tabular text-xs ${active ? "opacity-70" : "text-[color:var(--color-ink-3)]"}`}>
                  {counts[c]}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Coaching note for the active category */}
      {activeNote && (
        <section className="container-prose pt-10">
          <div className="tint-accent rounded-r-md py-4 pl-5 pr-6 text-[color:var(--color-ink-2)]">
            <p className="eyebrow text-[color:var(--color-accent-ink)] mb-2">
              What separates pass from fail
            </p>
            <p>{activeNote.passLine}</p>
          </div>
        </section>
      )}

      {/* List */}
      <section className="container-prose pt-8 pb-20">
        <ol>
          {filtered.map((q) => (
            <li
              key={q.number}
              className="grid grid-cols-12 gap-x-4 py-5 hairline-b items-baseline"
            >
              <span className="col-span-2 sm:col-span-1 nums-tabular text-sm text-[color:var(--color-ink-4)]">
                Q{String(q.number).padStart(2, "0")}
              </span>
              <h3 className="col-span-10 sm:col-span-7 font-display text-xl tracking-tight text-[color:var(--color-ink)]">
                {q.text}
              </h3>
              <span className="col-span-12 sm:col-span-3 mt-2 sm:mt-0 text-sm text-[color:var(--color-ink-3)]">
                {q.category}
              </span>
              <div className="col-span-12 sm:col-span-1 mt-2 sm:mt-0">
                <button
                  onClick={() => setDrill(q)}
                  className="text-sm text-[color:var(--color-accent)] hover:text-[color:var(--color-accent-2)] ease-standard"
                >
                  Drill &rarr;
                </button>
              </div>
            </li>
          ))}
        </ol>
        {filtered.length === 0 && (
          <p className="py-12 text-center text-[color:var(--color-ink-3)]">No questions in this category.</p>
        )}
      </section>

      {drill && <DrillModal question={drill} onClose={() => setDrill(null)} />}
    </>
  );
}

/* ─── Drill timer modal ────────────────────────────────────────────────── */

function DrillModal({ question, onClose }: { question: Question; onClose: () => void }) {
  const DEFAULT_SECONDS = 45 * 60;
  const [remaining, setRemaining] = useState(DEFAULT_SECONDS);
  const [running, setRunning] = useState(false);
  const tickRef = useRef<number | null>(null);

  // ESC closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!running) return;
    tickRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (tickRef.current) window.clearInterval(tickRef.current);
          setRunning(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [running]);

  const min = Math.floor(remaining / 60).toString().padStart(2, "0");
  const sec = (remaining % 60).toString().padStart(2, "0");

  // 4-min DASME marker
  const dasmeMark = remaining > DEFAULT_SECONDS - 4 * 60 ? "Define" :
                    remaining > DEFAULT_SECONDS - 16 * 60 ? "Architect" :
                    remaining > DEFAULT_SECONDS - 26 * 60 ? "Specify" :
                    remaining > DEFAULT_SECONDS - 31 * 60 ? "Map metrics" :
                    remaining > 0 ? "Edge cases" : "Stop";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Drill timer"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-[color:var(--color-ink)]/35 backdrop-blur-sm flex items-end sm:items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-2xl bg-[color:var(--color-paper)] hairline rounded-t-2xl sm:rounded-2xl p-7 sm:p-9 m-0 sm:m-6"
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="eyebrow text-[color:var(--color-accent)]">Drill mode · 45 min</p>
            <h3 className="mt-2 font-display text-2xl md:text-3xl tracking-tight text-[color:var(--color-ink)]">
              Q{question.number}. {question.text}
            </h3>
            <p className="mt-2 text-sm text-[color:var(--color-ink-3)]">{question.category}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-[color:var(--color-ink-3)] hover:text-[color:var(--color-ink)] ease-standard"
          >
            <kbd>esc</kbd>
          </button>
        </div>

        <div className="mt-8 hairline-t pt-8 flex items-end justify-between flex-wrap gap-y-4">
          <div>
            <p className="eyebrow mb-1">Phase</p>
            <p className="font-display text-2xl text-[color:var(--color-ink)]">{dasmeMark}</p>
          </div>
          <div>
            <p className="eyebrow mb-1">Remaining</p>
            <p className="font-display nums-tabular text-6xl md:text-7xl text-[color:var(--color-ink)]">
              {min}:{sec}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={() => setRunning((r) => !r)}
            className="px-5 py-2.5 rounded-full bg-[color:var(--color-ink)] text-[color:var(--color-paper)] text-sm font-medium ease-standard hover:bg-[color:var(--color-accent-2)]"
          >
            {running ? "Pause" : remaining === 0 ? "Restart" : "Start"}
          </button>
          <button
            onClick={() => { setRunning(false); setRemaining(DEFAULT_SECONDS); }}
            className="px-5 py-2.5 rounded-full hairline text-sm font-medium text-[color:var(--color-ink)] ease-standard hover:bg-[color:var(--color-paper-2)]"
          >
            Reset
          </button>
        </div>

        <ul className="dash-list mt-8 text-sm text-[color:var(--color-ink-2)] space-y-1.5">
          <li>Set 45-min timer. Open Miro / FigJam / Slides. Share screen.</li>
          <li>Diagram within 4 min. Four layers: interaction · orchestration · agents · data.</li>
          <li>Three named agents with non-overlapping roles. Name the model for each.</li>
          <li>Surface ≥2 failure modes proactively, while drawing.</li>
          <li>10x scale: name the bottleneck first, then concrete fixes.</li>
        </ul>
      </div>
    </div>
  );
}
