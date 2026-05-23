"use client";

import { useState } from "react";
import { useInterview } from "@/context/InterviewContext";
import { CATEGORIES, DIFFICULTIES } from "@/lib/constants";
import { getRound, ROUNDS } from "@/lib/rounds";
import type {
  QuestionCategory,
  Difficulty,
  Round,
  SessionMode,
  Question,
  LoopState,
} from "@/types";
import ErrorBanner from "@/components/shared/ErrorBanner";
import RoundPicker from "./RoundPicker";
import LoopRoundsPicker from "./LoopRoundsPicker";

const MODES: { value: SessionMode; label: string }[] = [
  { value: "standard", label: "Standard" },
  { value: "jd", label: "Job Description" },
  { value: "round", label: "Round Practice" },
  { value: "loop", label: "Full Loop" },
];

export default function SetupPanel() {
  const { dispatch } = useInterview();
  const [mode, setMode] = useState<SessionMode>("standard");
  const [category, setCategory] = useState<QuestionCategory>("behavioral");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [count, setCount] = useState(5);
  const [jdText, setJdText] = useState("");
  const [round, setRound] = useState<Round | null>(null);
  const [loopRounds, setLoopRounds] = useState<Round[]>([]);
  const [adversarial, setAdversarial] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart() {
    setError(null);
    setLoading(true);
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      if (mode === "standard") {
        dispatch({
          type: "SET_CONFIG",
          payload: { mode: "standard", category, difficulty, questionCount: count, adversarial, voiceEnabled },
        });
        const res = await fetch("/api/generate-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category, difficulty, count }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to generate questions");
        }
        const data = await res.json();
        dispatch({ type: "SET_QUESTIONS", payload: data.questions });
      } else if (mode === "jd") {
        if (jdText.length < 50) {
          throw new Error("Please enter a more detailed job description (at least 50 characters)");
        }
        dispatch({
          type: "SET_CONFIG",
          payload: { mode: "jd", questionCount: count, jdText, adversarial, voiceEnabled },
        });
        const res = await fetch("/api/generate-jd-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobDescription: jdText, count }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to generate questions");
        }
        const data = await res.json();
        dispatch({
          type: "SET_CONFIG",
          payload: {
            mode: "jd",
            questionCount: count,
            jdText,
            jdExtractedSkills: data.extractedSkills,
            jdExtractedRequirements: data.extractedRequirements,
            jdCompanyContext: data.companyContext,
            adversarial,
            voiceEnabled,
          },
        });
        dispatch({ type: "SET_QUESTIONS", payload: data.questions });
      } else if (mode === "round") {
        if (!round) throw new Error("Pick a round to practice");
        dispatch({
          type: "SET_CONFIG",
          payload: {
            mode: "round",
            round,
            questionCount: count,
            adversarial,
            voiceEnabled,
          },
        });
        const res = await fetch("/api/generate-round-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ round, count }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to generate round questions");
        }
        const data = await res.json();
        dispatch({ type: "SET_QUESTIONS", payload: data.questions });
      } else if (mode === "loop") {
        if (loopRounds.length === 0) throw new Error("Pick at least one round for the loop");
        dispatch({
          type: "SET_CONFIG",
          payload: {
            mode: "loop",
            rounds: loopRounds,
            questionCount: count,
            adversarial,
            voiceEnabled,
          },
        });

        // Generate questions for every round in parallel
        const results = await Promise.all(
          loopRounds.map(async (r) => {
            const def = getRound(r);
            const res = await fetch("/api/generate-round-questions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ round: r, count: def.defaultCount }),
            });
            if (!res.ok) {
              const err = await res.json();
              throw new Error(err.error || `Failed to generate questions for round ${r}`);
            }
            const data = (await res.json()) as { questions: Question[] };
            return { round: r, questions: data.questions };
          }),
        );

        // Flatten while preserving round order; stamp the round on each question
        const flat: Question[] = [];
        const perRound: Record<string, string[]> = {};
        const perRoundTotals: Record<string, number> = {};
        for (const { round: r, questions } of results) {
          const stamped = questions.map((q) => ({ ...q, round: r }));
          flat.push(...stamped);
          perRound[r] = stamped.map((q) => q.id);
          perRoundTotals[r] = stamped.length;
        }

        const loopState: LoopState = {
          rounds: loopRounds,
          currentRoundIndex: 0,
          perRoundQuestionIds: perRound as LoopState["perRoundQuestionIds"],
          perRoundTotals,
          storyMentions: [],
        };
        dispatch({ type: "INIT_LOOP", payload: loopState });
        dispatch({ type: "SET_QUESTIONS", payload: flat });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      dispatch({ type: "SET_ERROR", payload: message });
    } finally {
      setLoading(false);
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Interview Setup</h1>
      <p className="text-slate-500 mb-6">Configure your practice session</p>

      {/* Mode Tabs */}
      <div className="grid grid-cols-4 bg-slate-100 rounded-xl p-1 mb-6">
        {MODES.map((m) => (
          <button
            key={m.value}
            onClick={() => setMode(m.value)}
            className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
              mode === m.value
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === "standard" && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Question Category</label>
            <div className="grid grid-cols-3 gap-3">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    category === c.value
                      ? "border-indigo-300 bg-indigo-50 ring-1 ring-indigo-300"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className="text-sm font-medium text-slate-900">{c.label}</span>
                  <p className="text-xs text-slate-500 mt-1">{c.description}</p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Difficulty</label>
            <div className="flex gap-3">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDifficulty(d.value)}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    difficulty === d.value
                      ? "border-indigo-300 bg-indigo-50 ring-1 ring-indigo-300 text-indigo-700"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {mode === "jd" && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Paste the job description
          </label>
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the full job description here. The AI will extract key skills and generate tailored interview questions..."
            rows={8}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 resize-none"
          />
          <p className="text-xs text-slate-400 mt-1">{jdText.length} characters</p>
        </div>
      )}

      {mode === "round" && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">
            Pick the round you're prepping for
          </label>
          <RoundPicker selected={round} onSelect={setRound} disabled={loading} />
        </div>
      )}

      {mode === "loop" && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">
            Loop sequence (pick the rounds; order = your selection order)
          </label>
          <LoopRoundsPicker
            selected={loopRounds}
            onChange={setLoopRounds}
            disabled={loading}
          />
          {loopRounds.length > 0 && (
            <p className="text-xs text-slate-500">
              Questions per round use that round's default count. Estimated total:{" "}
              {loopRounds.reduce((sum, r) => sum + getRound(r).defaultCount, 0)} questions across{" "}
              {loopRounds.length} round{loopRounds.length === 1 ? "" : "s"}.
            </p>
          )}
        </div>
      )}

      {/* Question Count (not for loop, which uses per-round defaults) */}
      {mode !== "loop" && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Number of Questions: {count}
          </label>
          <input
            type="range"
            min={3}
            max={10}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>3</span>
            <span>10</span>
          </div>
        </div>
      )}

      {/* Options block — adversarial + voice */}
      <div className="mt-6 space-y-3">
        <p className="text-sm font-medium text-slate-700">Options</p>
        <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:border-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={adversarial}
            onChange={(e) => setAdversarial(e.target.checked)}
            className="mt-1 accent-indigo-600"
          />
          <span>
            <span className="text-sm font-semibold text-slate-900 block">Adversarial follow-up</span>
            <span className="text-xs text-slate-500">
              After each answer, push back until you name risk / falsifier / guardrail (max 3 turns).
              The §4.1 frontier-AI calibration drill.
            </span>
          </span>
        </label>
        <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:border-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={voiceEnabled}
            onChange={(e) => setVoiceEnabled(e.target.checked)}
            className="mt-1 accent-indigo-600"
          />
          <span>
            <span className="text-sm font-semibold text-slate-900 block">Voice mode</span>
            <span className="text-xs text-slate-500">
              Record your answer; transcribe via Whisper. Scores pacing, fillers, and the target window
              (90s for recruiter, 4-min for product sense). Requires <code>OPENAI_API_KEY</code> on the server.
            </span>
          </span>
        </label>
      </div>

      {error && (
        <div className="mt-4">
          <ErrorBanner message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      <button
        onClick={handleStart}
        disabled={loading}
        className="mt-8 w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-300 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {mode === "loop" ? `Generating ${ROUNDS.length} rounds...` : "Generating Questions..."}
          </>
        ) : (
          mode === "loop" ? "Start Loop" : "Start Interview"
        )}
      </button>
    </div>
  );
}
