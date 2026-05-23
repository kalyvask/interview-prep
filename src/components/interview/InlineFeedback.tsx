"use client";

import type { Evaluation, FreeTextEvaluation, MCEvaluation, VoiceCapture } from "@/types";

export default function InlineFeedback({
  evaluation,
  voice,
}: {
  evaluation: Evaluation;
  voice?: VoiceCapture;
}) {
  if (evaluation.type === "freetext") {
    return <FreeTextFeedback eval={evaluation} voice={voice} />;
  }
  return <MCFeedback eval={evaluation} />;
}

function FreeTextFeedback({ eval: ev, voice }: { eval: FreeTextEvaluation; voice?: VoiceCapture }) {
  const scoreColor =
    ev.overallScore >= 8
      ? "text-green-600 bg-green-50 border-green-200"
      : ev.overallScore >= 6
        ? "text-yellow-600 bg-yellow-50 border-yellow-200"
        : "text-red-600 bg-red-50 border-red-200";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">AI Feedback</h3>
        <span className={`px-3 py-1.5 rounded-xl border font-bold text-lg ${scoreColor}`}>
          {ev.overallScore}/10
        </span>
      </div>

      {/* Round rubric */}
      {ev.roundScores && ev.roundScores.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-3">Round rubric</h4>
          <div className="space-y-2">
            {ev.roundScores.map((d, i) => {
              const color =
                d.score >= 3
                  ? "bg-green-50 border-green-200 text-green-900"
                  : d.score === 2
                    ? "bg-yellow-50 border-yellow-200 text-yellow-900"
                    : "bg-red-50 border-red-200 text-red-900";
              return (
                <div key={i} className={`p-3 rounded-xl border ${color}`}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-semibold">{d.dimension}</span>
                    <span className="text-sm font-bold">{d.score}/3</span>
                  </div>
                  <p className="text-xs leading-snug mt-1">{d.feedback}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Uncertainty sentence check */}
      {ev.uncertainty && (
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-2">Uncertainty signals</h4>
          <div className="grid grid-cols-3 gap-2">
            {([
              { key: "hasRisk", label: "Risk" },
              { key: "hasFalsifier", label: "Falsifier" },
              { key: "hasGuardrail", label: "Guardrail" },
            ] as const).map(({ key, label }) => {
              const present = ev.uncertainty![key];
              return (
                <div
                  key={key}
                  className={`p-3 rounded-xl border text-center ${
                    present
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-slate-50 border-slate-200 text-slate-500"
                  }`}
                >
                  <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
                  <p className="text-xs mt-1">{present ? "Present" : "Missing"}</p>
                </div>
              );
            })}
          </div>
          {ev.uncertainty.summary && (
            <p className="text-xs text-slate-500 mt-2">{ev.uncertainty.summary}</p>
          )}
        </div>
      )}

      {/* Voice scoring */}
      {voice && (
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-2">Voice scoring</h4>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <Stat
              label="Duration"
              value={`${Math.round(voice.durationMs / 1000)}s`}
              hint={`Target ${voice.targetWindowSec ?? "?"}s`}
              good={voice.inTargetWindow}
            />
            <Stat
              label="Pace"
              value={`${voice.wordsPerMinute ?? "?"} wpm`}
              hint="110-180 ideal"
              good={
                voice.wordsPerMinute !== undefined &&
                voice.wordsPerMinute >= 110 &&
                voice.wordsPerMinute <= 180
              }
            />
            <Stat
              label="Fillers"
              value={String(voice.fillerCount ?? "?")}
              hint="lower is better"
              good={(voice.fillerCount ?? 0) <= 4}
            />
          </div>
          {voice.pacingFeedback && (
            <p className="text-xs text-slate-600 leading-relaxed">{voice.pacingFeedback}</p>
          )}
        </div>
      )}

      {/* STAR Breakdown */}
      {ev.frameworkScore && (
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-3">STAR Breakdown</h4>
          <div className="grid grid-cols-4 gap-2">
            {(["situation", "task", "action", "result"] as const).map((key) => {
              const item = ev.frameworkScore![key];
              const color = !item.present
                ? "bg-red-50 border-red-200"
                : item.score >= 7
                  ? "bg-green-50 border-green-200"
                  : "bg-yellow-50 border-yellow-200";
              return (
                <div key={key} className={`p-3 rounded-xl border ${color}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold uppercase text-slate-600">
                      {key.charAt(0)}
                    </span>
                    <span className="text-xs font-semibold">
                      {item.present ? `${item.score}/10` : "Missing"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-snug">{item.feedback}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Strengths */}
      <div>
        <h4 className="text-sm font-medium text-green-700 mb-2">Strengths</h4>
        <ul className="space-y-1.5">
          {ev.strengths.map((s, i) => (
            <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
              <span className="text-green-500 mt-0.5">+</span>
              {s}
            </li>
          ))}
        </ul>
      </div>

      {/* Improvements */}
      <div>
        <h4 className="text-sm font-medium text-orange-700 mb-2">Areas for Improvement</h4>
        <ul className="space-y-1.5">
          {ev.improvements.map((imp, i) => (
            <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
              <span className="text-orange-500 mt-0.5">&#8594;</span>
              {imp}
            </li>
          ))}
        </ul>
      </div>

      {/* Detailed Feedback */}
      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-2">Detailed Feedback</h4>
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
          {ev.detailedFeedback}
        </p>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  good,
}: {
  label: string;
  value: string;
  hint?: string;
  good?: boolean;
}) {
  return (
    <div
      className={`p-3 rounded-xl border text-center ${
        good
          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
          : "bg-slate-50 border-slate-200 text-slate-700"
      }`}
    >
      <p className="text-xs uppercase tracking-wide">{label}</p>
      <p className="text-lg font-bold leading-none mt-1">{value}</p>
      {hint && <p className="text-[10px] text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}

function MCFeedback({ eval: ev }: { eval: MCEvaluation }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 animate-fade-in space-y-4">
      <div className="flex items-center gap-3">
        <span
          className={`px-3 py-1.5 rounded-xl font-semibold text-sm ${
            ev.correct
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {ev.correct ? "Correct!" : "Not quite"}
        </span>
        <span className="text-sm text-slate-500">
          Best answer: <strong>{ev.bestOptionId}</strong>
        </span>
      </div>

      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-1">Explanation</h4>
        <p className="text-sm text-slate-600 leading-relaxed">{ev.explanation}</p>
      </div>

      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-1">Key Takeaway</h4>
        <p className="text-sm text-indigo-700 bg-indigo-50 rounded-xl px-4 py-3">
          {ev.learningPoint}
        </p>
      </div>
    </div>
  );
}
