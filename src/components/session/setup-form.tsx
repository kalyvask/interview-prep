"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { parsePdfToText } from "@/lib/pdf-parse";
import { getRound } from "@/lib/rounds";
import {
  QUESTIONS,
  STAGE_LABELS,
  STAGE_ORDER,
} from "@/content/questions";
import type { Stage as BankStage } from "@/content/questions";
import type { SessionQuestion } from "@/types/session";

type SourceMode = "generate" | "pick";

export interface StartInput {
  mode: SourceMode;
  cvText: string;
  jdText: string;
  cvFileName?: string;
  pickedQuestions?: SessionQuestion[];
}

interface SetupFormProps {
  initialCvText?: string;
  initialJdText?: string;
  onStart: (input: StartInput) => void;
  isLoading?: boolean;
  error?: string | null;
  /** True when the initialCvText came from src/content/personal.ts. */
  personalProfileLoaded?: boolean;
}

const MAX_PICKS = 10;

export default function SetupForm({
  initialCvText = "",
  initialJdText = "",
  onStart,
  isLoading,
  error,
  personalProfileLoaded = false,
}: SetupFormProps) {
  const [mode, setMode] = useState<SourceMode>("generate");
  const [cvText, setCvText] = useState(initialCvText);
  const [cvFileName, setCvFileName] = useState<string | undefined>(
    personalProfileLoaded && initialCvText ? "Loaded from personal profile" : undefined,
  );
  const [jdText, setJdText] = useState(initialJdText);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [showCvAsText, setShowCvAsText] = useState(false);

  // Pick-mode state
  const [activeStage, setActiveStage] = useState<BankStage | "All">("All");
  const [pickedNumbers, setPickedNumbers] = useState<Set<number>>(new Set());

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setParseError(null);
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      setParseError("File must be a PDF. Or paste your CV as text instead.");
      return;
    }
    setIsParsing(true);
    try {
      const text = await parsePdfToText(file);
      if (text.length < 100) {
        setParseError(
          "The PDF parsed to less than 100 characters. Try pasting the text manually.",
        );
        setShowCvAsText(true);
        return;
      }
      setCvText(text);
      setCvFileName(file.name);
    } catch (err) {
      const message = err instanceof Error ? err.message : "PDF parsing failed";
      setParseError(`${message}. Try pasting the text manually.`);
      setShowCvAsText(true);
    } finally {
      setIsParsing(false);
    }
  }, []);

  const filteredBank = useMemo(
    () =>
      activeStage === "All"
        ? QUESTIONS
        : QUESTIONS.filter((q) => q.stage === activeStage),
    [activeStage],
  );

  const stageCounts: Record<string, number> = useMemo(() => {
    const out: Record<string, number> = { All: QUESTIONS.length };
    for (const s of STAGE_ORDER)
      out[s] = QUESTIONS.filter((q) => q.stage === s).length;
    return out;
  }, []);

  const togglePick = (n: number) => {
    setPickedNumbers((prev) => {
      const next = new Set(prev);
      if (next.has(n)) {
        next.delete(n);
      } else if (next.size < MAX_PICKS) {
        next.add(n);
      }
      return next;
    });
  };

  const buildPickedSession = (): SessionQuestion[] => {
    // Preserve pick order so the candidate goes through them in the order
    // they checked them (most recent last). The Set preserves insertion order.
    const ordered = Array.from(pickedNumbers);
    return ordered
      .map((n) => QUESTIONS.find((q) => q.number === n))
      .filter((q): q is NonNullable<typeof q> => Boolean(q))
      .map((q): SessionQuestion => {
        const target = getRound(q.stage).targetWindowSec;
        const cat =
          q.stage === "technical_dasme"
            ? "technical"
            : q.stage === "behavioral_values" ||
                q.stage === "recruiter" ||
                q.stage === "hiring_manager"
              ? "behavioral"
              : "role-specific";
        return {
          id: `bank_${q.number}`,
          text: q.text,
          category: cat,
          rationale: `From the question bank · ${STAGE_LABELS[q.stage]}`,
          targetSeconds: target,
          stage: q.stage,
        };
      });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "generate") {
      onStart({
        mode,
        cvText: cvText.trim(),
        jdText: jdText.trim(),
        cvFileName,
      });
    } else {
      onStart({
        mode,
        cvText: cvText.trim(),
        jdText: jdText.trim(),
        cvFileName,
        pickedQuestions: buildPickedSession(),
      });
    }
  };

  const cvWordCount = cvText.trim().split(/\s+/).filter(Boolean).length;
  const jdWordCount = jdText.trim().split(/\s+/).filter(Boolean).length;

  const canSubmitGenerate =
    mode === "generate" &&
    cvText.trim().length >= 100 &&
    jdText.trim().length >= 100 &&
    !isLoading;
  const canSubmitPick = mode === "pick" && pickedNumbers.size > 0 && !isLoading;
  const canSubmit = canSubmitGenerate || canSubmitPick;

  return (
    <form onSubmit={onSubmit} className="space-y-10">
      {/* Mode picker */}
      <section>
        <h2 className="font-display text-2xl text-[color:var(--color-ink)] mb-3">
          Question source
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {(
            [
              {
                value: "generate",
                title: "Generated for me",
                desc: "Upload CV + paste JD. AI generates 5 personalized questions (2 behavioral, 2 role-specific, 1 technical).",
              },
              {
                value: "pick",
                title: "Pick from the bank",
                desc: `Choose up to ${MAX_PICKS} questions from the 140-question bank, filtered by interview stage. Add CV + JD for personalized grading (optional).`,
              },
            ] as { value: SourceMode; title: string; desc: string }[]
          ).map((opt) => {
            const active = mode === opt.value;
            return (
              <label
                key={opt.value}
                className={`cursor-pointer rounded-2xl p-5 ease-standard transition-colors ${
                  active
                    ? "border-2 border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft)]"
                    : "hairline hover:bg-[color:var(--color-paper-2)] p-5"
                }`}
              >
                <input
                  type="radio"
                  name="mode"
                  value={opt.value}
                  checked={active}
                  onChange={() => setMode(opt.value)}
                  className="sr-only"
                />
                <div className="flex items-baseline gap-2 mb-1">
                  <span
                    aria-hidden
                    className={`inline-block size-2 rounded-full ${
                      active
                        ? "bg-[color:var(--color-accent)]"
                        : "bg-[color:var(--color-ink-4)]"
                    }`}
                  />
                  <span className="font-medium text-[color:var(--color-ink)]">
                    {opt.title}
                  </span>
                </div>
                <p className="text-sm text-[color:var(--color-ink-2)] leading-snug">
                  {opt.desc}
                </p>
              </label>
            );
          })}
        </div>
      </section>

      {/* Pick-mode bank selector */}
      {mode === "pick" && (
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-display text-2xl text-[color:var(--color-ink)]">
              Pick your questions
            </h2>
            <p className="text-sm text-[color:var(--color-ink-3)] nums-tabular">
              {pickedNumbers.size} / {MAX_PICKS} selected
            </p>
          </div>

          {/* Stage filter chips */}
          <div className="flex flex-wrap gap-2 mb-5">
            {(["All", ...STAGE_ORDER] as Array<BankStage | "All">).map((s) => {
              const active = s === activeStage;
              const label = s === "All" ? "All" : STAGE_LABELS[s as BankStage];
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setActiveStage(s)}
                  className={`px-3 py-1.5 rounded-full text-sm ease-standard transition-colors hairline ${
                    active
                      ? "bg-[color:var(--color-ink)] text-[color:var(--color-paper)] border-[color:var(--color-ink)]"
                      : "text-[color:var(--color-ink-2)] hover:bg-[color:var(--color-paper-2)]"
                  }`}
                >
                  {label}
                  <span
                    className={`ml-2 nums-tabular text-xs ${
                      active ? "opacity-70" : "text-[color:var(--color-ink-3)]"
                    }`}
                  >
                    {stageCounts[s]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Question list */}
          <div className="hairline rounded-2xl overflow-hidden max-h-[28rem] overflow-y-auto">
            {filteredBank.map((q, idx) => {
              const checked = pickedNumbers.has(q.number);
              const atCap = !checked && pickedNumbers.size >= MAX_PICKS;
              return (
                <label
                  key={q.number}
                  className={`block px-4 py-3 text-sm cursor-pointer ease-standard transition-colors ${
                    idx > 0 ? "hairline-t" : ""
                  } ${
                    checked
                      ? "bg-[color:var(--color-accent-soft)]"
                      : atCap
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-[color:var(--color-paper-2)]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePick(q.number)}
                      disabled={atCap}
                      className="mt-1 accent-[color:var(--color-accent)]"
                    />
                    <div className="flex-1">
                      <p className="text-[color:var(--color-ink)] leading-snug">
                        {q.text}
                      </p>
                      <p className="text-xs text-[color:var(--color-ink-3)] mt-1">
                        Q{String(q.number).padStart(3, "0")} ·{" "}
                        {STAGE_LABELS[q.stage]} · {q.category}
                      </p>
                    </div>
                  </div>
                </label>
              );
            })}
            {filteredBank.length === 0 && (
              <p className="px-4 py-6 text-center text-[color:var(--color-ink-3)] text-sm">
                No questions in this stage.
              </p>
            )}
          </div>
        </section>
      )}

      {/* CV upload — required in generate mode, optional in pick mode */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display text-2xl text-[color:var(--color-ink)]">
            Your CV
            {mode === "pick" && (
              <span className="ml-3 text-sm text-[color:var(--color-ink-3)] font-normal">
                (optional — improves grading)
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={() => setShowCvAsText((v) => !v)}
            className="text-sm text-[color:var(--color-ink-3)] hover:text-[color:var(--color-ink-2)] underline-offset-4 hover:underline ease-standard transition-colors"
          >
            {showCvAsText ? "Use PDF upload" : "Paste as text"}
          </button>
        </div>

        {!showCvAsText && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "copy";
            }}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) handleFile(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            className="hairline rounded-2xl p-10 text-center cursor-pointer hover:bg-[color:var(--color-paper-2)] ease-standard transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            {isParsing ? (
              <p className="text-[color:var(--color-ink-2)]">Parsing PDF…</p>
            ) : cvText.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[color:var(--color-ink)] font-medium">
                  {cvFileName || "CV loaded"}
                </p>
                <p className="text-sm text-[color:var(--color-ink-3)]">
                  {cvWordCount.toLocaleString()} words parsed. Click to replace.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[color:var(--color-ink)] font-medium">
                  Drop your CV here, or click to select.
                </p>
                <p className="text-sm text-[color:var(--color-ink-3)]">
                  PDF only. Parsed in the browser; never leaves your machine.
                </p>
              </div>
            )}
          </div>
        )}

        {showCvAsText && (
          <textarea
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            placeholder="Paste your CV here…"
            rows={10}
            className="w-full rounded-2xl hairline p-4 bg-[color:var(--color-paper-2)] text-[color:var(--color-ink)] placeholder-[color:var(--color-ink-4)] focus:outline-none focus:ring-0 focus:border-[color:var(--color-accent)]"
          />
        )}

        {parseError && (
          <p className="mt-3 text-sm text-[color:var(--color-danger)]">{parseError}</p>
        )}
        {cvText.length > 0 && (
          <p className="mt-2 text-xs text-[color:var(--color-ink-3)]">
            {cvWordCount.toLocaleString()} words ·{" "}
            {cvText.length.toLocaleString()} characters
          </p>
        )}
      </section>

      {/* JD paste — required in generate mode, optional in pick mode */}
      <section>
        <h2 className="font-display text-2xl text-[color:var(--color-ink)] mb-3">
          The job description
          {mode === "pick" && (
            <span className="ml-3 text-sm text-[color:var(--color-ink-3)] font-normal">
              (optional — improves grading)
            </span>
          )}
        </h2>
        <textarea
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder={
            mode === "generate"
              ? "Paste the full JD. The role's stated requirements drive which questions get generated."
              : "Paste the JD if you want the grader to cross-reference your answer against the role's stated requirements."
          }
          rows={10}
          className="w-full rounded-2xl hairline p-4 bg-[color:var(--color-paper-2)] text-[color:var(--color-ink)] placeholder-[color:var(--color-ink-4)] focus:outline-none focus:border-[color:var(--color-accent)]"
        />
        {jdText.length > 0 && (
          <p className="mt-2 text-xs text-[color:var(--color-ink-3)]">
            {jdWordCount.toLocaleString()} words ·{" "}
            {jdText.length.toLocaleString()} characters
          </p>
        )}
      </section>

      {/* Submit */}
      {error && (
        <div className="tint-paper rounded-2xl p-4">
          <p className="text-sm text-[color:var(--color-danger)]">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[color:var(--color-ink)] text-[color:var(--color-paper)] text-[15px] font-medium ease-standard transition-colors hover:bg-[color:var(--color-accent-2)] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading
            ? "Generating questions…"
            : mode === "generate"
              ? "Start the interview"
              : `Run with ${pickedNumbers.size || "0"} ${pickedNumbers.size === 1 ? "question" : "questions"}`}
          <span aria-hidden>→</span>
        </button>
        {mode === "generate" && !canSubmitGenerate && !isLoading && (
          <p className="text-sm text-[color:var(--color-ink-3)]">
            CV and JD both need at least 100 characters.
          </p>
        )}
        {mode === "pick" && !canSubmitPick && !isLoading && (
          <p className="text-sm text-[color:var(--color-ink-3)]">
            Pick at least one question.
          </p>
        )}
      </div>
    </form>
  );
}
