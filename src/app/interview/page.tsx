"use client";

import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import Link from "next/link";
import { STAGE_LABELS } from "@/content/questions";
import SetupForm, { type StartInput } from "@/components/session/setup-form";
import CoachAudio from "@/components/session/coach-audio";
import Recorder from "@/components/session/recorder";
import GradeCard from "@/components/session/grade-card";
import type {
  ClientConfig,
  SessionAnswer,
  SessionGrade,
  SessionQuestion,
  SessionState,
  SessionSummary,
} from "@/types/session";

const STORAGE_KEY = "interview-prep-session-v1";

const initialState: SessionState = {
  status: "setup",
  cvText: "",
  jdText: "",
  questions: [],
  currentIndex: 0,
  answers: {},
  grades: {},
  summary: null,
  error: null,
};

type Action =
  | { type: "RESET" }
  | { type: "SET_CONTEXT"; payload: { cvText: string; jdText: string; cvFileName?: string } }
  | { type: "START_LOADING" }
  | { type: "SET_QUESTIONS"; payload: SessionQuestion[] }
  | { type: "SUBMIT_ANSWER"; payload: SessionAnswer }
  | { type: "SET_GRADE"; payload: { questionId: string; grade: SessionGrade } }
  | { type: "ADVANCE" }
  | { type: "START_SUMMARY" }
  | { type: "SET_SUMMARY"; payload: SessionSummary }
  | { type: "SET_ERROR"; payload: string };

function reducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case "RESET":
      return initialState;
    case "SET_CONTEXT":
      return {
        ...state,
        cvText: action.payload.cvText,
        jdText: action.payload.jdText,
        cvFileName: action.payload.cvFileName,
        status: "loading_questions",
        error: null,
      };
    case "START_LOADING":
      return { ...state, status: "loading_questions", error: null };
    case "SET_QUESTIONS":
      return {
        ...state,
        questions: action.payload,
        currentIndex: 0,
        status: "active",
        answers: {},
        grades: {},
        summary: null,
        error: null,
      };
    case "SUBMIT_ANSWER":
      return {
        ...state,
        answers: { ...state.answers, [action.payload.questionId]: action.payload },
        status: "grading",
      };
    case "SET_GRADE":
      return {
        ...state,
        grades: { ...state.grades, [action.payload.questionId]: action.payload.grade },
        status: "reviewing",
      };
    case "ADVANCE": {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.questions.length) {
        return { ...state, status: "summarizing" };
      }
      return { ...state, currentIndex: nextIndex, status: "active" };
    }
    case "START_SUMMARY":
      return { ...state, status: "summarizing" };
    case "SET_SUMMARY":
      return { ...state, summary: action.payload, status: "complete" };
    case "SET_ERROR":
      return { ...state, status: "error", error: action.payload };
    default:
      return state;
  }
}

function loadInitial(): SessionState {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as SessionState;
    // Drop transient states on reload
    if (parsed.status === "loading_questions" || parsed.status === "grading" || parsed.status === "summarizing") {
      return { ...parsed, status: parsed.questions.length > 0 ? "active" : "setup" };
    }
    return parsed;
  } catch {
    return initialState;
  }
}

export default function InterviewPage() {
  const [state, dispatch] = useReducer(reducer, initialState, loadInitial);
  const [config, setConfig] = useState<ClientConfig | null>(null);

  // Load capability config once
  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((c) => setConfig(c as ClientConfig))
      .catch(() => setConfig({
        voiceId: "EXAVITQu4vr4xnSDxMAi",
        elevenlabsAvailable: false,
        whisperAvailable: false,
        anthropicConfigured: false,
      }));
  }, []);

  // Persist state to sessionStorage on every change
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota errors
    }
  }, [state]);

  const currentQuestion = state.questions[state.currentIndex];
  const currentGrade = currentQuestion ? state.grades[currentQuestion.id] : undefined;
  const isLastQuestion = state.currentIndex === state.questions.length - 1;

  const startInterview = useCallback(
    async (input: StartInput) => {
      dispatch({
        type: "SET_CONTEXT",
        payload: {
          cvText: input.cvText,
          jdText: input.jdText,
          cvFileName: input.cvFileName,
        },
      });

      // Pick mode: the candidate already chose questions from the bank.
      // Skip /api/start-interview and go straight to the active state.
      if (input.mode === "pick" && input.pickedQuestions?.length) {
        dispatch({ type: "SET_QUESTIONS", payload: input.pickedQuestions });
        return;
      }

      try {
        const res = await fetch("/api/start-interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cvText: input.cvText, jdText: input.jdText }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
          dispatch({ type: "SET_ERROR", payload: err.error || "Failed to start" });
          return;
        }
        const data = (await res.json()) as { questions: SessionQuestion[] };
        dispatch({ type: "SET_QUESTIONS", payload: data.questions });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Network error";
        dispatch({ type: "SET_ERROR", payload: message });
      }
    },
    [],
  );

  const submitAnswer = useCallback(
    async (answer: SessionAnswer) => {
      dispatch({ type: "SUBMIT_ANSWER", payload: answer });
      const q = state.questions.find((x) => x.id === answer.questionId);
      if (!q) {
        dispatch({ type: "SET_ERROR", payload: "Question went missing." });
        return;
      }
      try {
        const res = await fetch("/api/grade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cvText: state.cvText,
            jdText: state.jdText,
            question: { text: q.text, stage: q.stage },
            answer: answer.transcript,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
          dispatch({ type: "SET_ERROR", payload: err.error || "Grading failed" });
          return;
        }
        const grade = (await res.json()) as SessionGrade;
        dispatch({ type: "SET_GRADE", payload: { questionId: answer.questionId, grade } });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Network error";
        dispatch({ type: "SET_ERROR", payload: message });
      }
    },
    [state.questions, state.cvText, state.jdText],
  );

  const advance = useCallback(async () => {
    if (!isLastQuestion) {
      dispatch({ type: "ADVANCE" });
      return;
    }
    // Compute summary
    dispatch({ type: "START_SUMMARY" });
    try {
      const grades = state.questions
        .map((q) => {
          const ans = state.answers[q.id];
          const gr = state.grades[q.id];
          if (!ans || !gr) return null;
          return {
            questionText: q.text,
            answer: ans.transcript,
            score: gr.score,
            strengths: gr.strengths,
            improvements: gr.improvements,
          };
        })
        .filter((g): g is NonNullable<typeof g> => g !== null);

      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText: state.cvText, jdText: state.jdText, grades }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        dispatch({ type: "SET_ERROR", payload: err.error || "Summary failed" });
        return;
      }
      const summary = (await res.json()) as SessionSummary;
      dispatch({ type: "SET_SUMMARY", payload: summary });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error";
      dispatch({ type: "SET_ERROR", payload: message });
    }
  }, [isLastQuestion, state.questions, state.cvText, state.jdText, state.answers, state.grades]);

  const reset = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    dispatch({ type: "RESET" });
  }, []);

  const configReady = config !== null;
  const showSetupForm = state.status === "setup" || state.status === "loading_questions";

  return (
    <div className="container-prose py-12 md:py-16">
      <Header state={state} reset={reset} />

      {!configReady && (
        <p className="text-sm text-[color:var(--color-ink-3)]">Loading config…</p>
      )}

      {configReady && !config.anthropicConfigured && (
        <div className="tint-paper rounded-2xl p-5 mb-8">
          <p className="text-sm text-[color:var(--color-danger)]">
            <code>ANTHROPIC_API_KEY</code> is not set on the server. Add it to{" "}
            <code>.env.local</code> and restart the dev server. See{" "}
            <code>.env.example</code> for the format.
          </p>
        </div>
      )}

      {configReady && showSetupForm && (
        <SetupForm
          initialCvText={state.cvText}
          initialJdText={state.jdText}
          onStart={startInterview}
          isLoading={state.status === "loading_questions"}
          error={state.error}
        />
      )}

      {(state.status === "active" ||
        state.status === "recording" ||
        state.status === "grading" ||
        state.status === "reviewing") &&
        currentQuestion && (
          <QuestionPanel
            question={currentQuestion}
            grade={currentGrade}
            status={state.status}
            currentIndex={state.currentIndex}
            totalQuestions={state.questions.length}
            config={config!}
            onAnswer={submitAnswer}
            onAdvance={advance}
            isLast={isLastQuestion}
          />
        )}

      {state.status === "summarizing" && (
        <div className="py-20 text-center">
          <p className="font-display text-2xl text-[color:var(--color-ink)]">
            Scoring the session…
          </p>
          <p className="text-sm text-[color:var(--color-ink-3)] mt-2">
            One moment while Claude reads back through all 5 answers.
          </p>
        </div>
      )}

      {state.status === "complete" && state.summary && (
        <SummaryView summary={state.summary} onReset={reset} state={state} />
      )}

      {state.status === "error" && (
        <div className="tint-paper rounded-2xl p-6 space-y-4">
          <p className="text-[color:var(--color-danger)] font-medium">
            {state.error || "Something went wrong."}
          </p>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full hairline text-sm text-[color:var(--color-ink)] hover:bg-[color:var(--color-paper-2)] ease-standard transition-colors"
          >
            Start over
          </button>
        </div>
      )}
    </div>
  );
}

function Header({ state, reset }: { state: SessionState; reset: () => void }) {
  const showReset = state.status !== "setup";
  return (
    <div className="mb-10 flex items-baseline justify-between gap-6">
      <div>
        <p className="eyebrow mb-3">Mock interview · personalized</p>
        <h1 className="font-display text-3xl md:text-4xl tracking-tight text-[color:var(--color-ink)]">
          {state.status === "setup" && "Set up the session."}
          {state.status === "loading_questions" && "Generating your questions…"}
          {state.status === "active" && `Question ${state.currentIndex + 1} of ${state.questions.length}`}
          {state.status === "recording" && `Question ${state.currentIndex + 1} of ${state.questions.length}`}
          {state.status === "grading" && "Grading your answer…"}
          {state.status === "reviewing" && `Question ${state.currentIndex + 1} of ${state.questions.length}`}
          {state.status === "summarizing" && "Wrapping up…"}
          {state.status === "complete" && "Session results"}
          {state.status === "error" && "Something went wrong."}
        </h1>
      </div>
      {showReset && (
        <button
          type="button"
          onClick={() => {
            if (window.confirm("End this session and start over?")) reset();
          }}
          className="text-sm text-[color:var(--color-ink-3)] hover:text-[color:var(--color-ink-2)] underline-offset-4 hover:underline ease-standard transition-colors"
        >
          End session
        </button>
      )}
    </div>
  );
}

function QuestionPanel({
  question,
  grade,
  status,
  currentIndex,
  totalQuestions,
  config,
  onAnswer,
  onAdvance,
  isLast,
}: {
  question: SessionQuestion;
  grade?: SessionGrade;
  status: SessionState["status"];
  currentIndex: number;
  totalQuestions: number;
  config: ClientConfig;
  onAnswer: (a: SessionAnswer) => void;
  onAdvance: () => void;
  isLast: boolean;
}) {
  const showAnswerSurface = status === "active";
  const showGrading = status === "grading";
  const showGrade = status === "reviewing" && grade;

  return (
    <div className="space-y-8">
      <ProgressDots current={currentIndex} total={totalQuestions} />

      <article className="space-y-4">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="eyebrow">
            {question.stage ? STAGE_LABELS[question.stage] : question.category}
          </span>
          {question.stage && (
            <span className="text-xs text-[color:var(--color-ink-4)]">
              · {question.category}
            </span>
          )}
          <span className="text-xs text-[color:var(--color-ink-4)] ml-auto">
            Target: {question.targetSeconds}s
          </span>
        </div>
        <p className="font-display text-2xl md:text-3xl leading-snug text-[color:var(--color-ink)]">
          {question.text}
        </p>
        {question.rationale && (
          <p className="text-sm text-[color:var(--color-ink-3)] italic">
            Why this question: {question.rationale}
          </p>
        )}
        <CoachAudio
          key={question.id}
          text={question.text}
          questionId={question.id}
          elevenlabsAvailable={config.elevenlabsAvailable}
          voiceId={config.voiceId}
        />
      </article>

      {showAnswerSurface && (
        <Recorder
          key={question.id}
          questionId={question.id}
          targetSeconds={question.targetSeconds}
          whisperAvailable={config.whisperAvailable}
          onAnswer={onAnswer}
        />
      )}

      {showGrading && (
        <div className="py-12 text-center">
          <p className="text-sm text-[color:var(--color-ink-2)]">Grading your answer…</p>
        </div>
      )}

      {showGrade && grade && (
        <div className="space-y-6">
          <GradeCard grade={grade} />
          <div className="pt-4 hairline-t">
            <button
              type="button"
              onClick={onAdvance}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[color:var(--color-ink)] text-[color:var(--color-paper)] text-[15px] font-medium ease-standard transition-colors hover:bg-[color:var(--color-accent-2)]"
            >
              {isLast ? "Finish + see summary" : "Next question"}
              <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          aria-hidden
          className={`h-1 rounded-full ease-standard transition-all ${
            i < current
              ? "w-8 bg-[color:var(--color-accent)]"
              : i === current
                ? "w-12 bg-[color:var(--color-ink)]"
                : "w-8 bg-[color:var(--color-rule)]"
          }`}
        />
      ))}
    </div>
  );
}

function SummaryView({
  summary,
  onReset,
  state,
}: {
  summary: SessionSummary;
  onReset: () => void;
  state: SessionState;
}) {
  const perQuestion = useMemo(
    () =>
      state.questions.map((q) => ({
        question: q,
        grade: state.grades[q.id],
      })),
    [state.questions, state.grades],
  );

  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <div className="flex items-baseline gap-4">
          <span className="font-display text-7xl nums-tabular text-[color:var(--color-accent)]">
            {summary.overallScore.toFixed(1)}
          </span>
          <span className="text-[color:var(--color-ink-3)]">/ 10</span>
          <span className="eyebrow ml-auto">Overall</span>
        </div>
        <p className="text-lg text-[color:var(--color-ink-2)] leading-relaxed max-w-prose font-display-italic">
          {summary.encouragement}
        </p>
      </section>

      <section className="space-y-4">
        <p className="eyebrow">Top three tweaks for the real interview</p>
        <ol className="space-y-3 nums-tabular">
          {summary.topThreeTweaks.map((t, i) => (
            <li key={i} className="flex gap-4">
              <span className="font-display text-3xl text-[color:var(--color-ink-4)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-[color:var(--color-ink-2)] leading-relaxed pt-1">{t}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-4 hairline-t pt-8">
        <p className="eyebrow">Question-by-question</p>
        <div className="space-y-3">
          {perQuestion.map(({ question, grade }) => (
            <div
              key={question.id}
              className="flex items-baseline gap-4 py-2 hairline-b last:border-b-0"
            >
              <span className="font-display text-2xl nums-tabular w-10 text-[color:var(--color-ink)]">
                {grade?.score ?? "—"}
              </span>
              <p className="text-sm text-[color:var(--color-ink-2)] flex-1">
                {question.text}
              </p>
              <span className="eyebrow text-xs hidden sm:inline">
                {question.category}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-3 pt-6">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[color:var(--color-ink)] text-[color:var(--color-paper)] text-sm font-medium ease-standard transition-colors hover:bg-[color:var(--color-accent-2)]"
        >
          Run another session
        </button>
        <Link
          href="/questions"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full hairline text-sm text-[color:var(--color-ink)] hover:bg-[color:var(--color-paper-2)] ease-standard transition-colors"
        >
          Browse the question bank
        </Link>
      </div>
    </div>
  );
}
