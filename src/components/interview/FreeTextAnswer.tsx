"use client";

import type { Question } from "@/types";

interface Props {
  value: string;
  onChange: (v: string) => void;
  question: Question;
  disabled?: boolean;
}

export default function FreeTextAnswer({ value, onChange, question, disabled }: Props) {
  const isBehavioral = question.category === "behavioral";
  const charCount = value.length;
  const recommended = 500;

  return (
    <div className="space-y-3">
      {isBehavioral && (
        <div className="grid grid-cols-4 gap-2">
          {["Situation", "Task", "Action", "Result"].map((step) => (
            <div
              key={step}
              className="text-center py-2 bg-indigo-50 rounded-lg border border-indigo-100"
            >
              <span className="text-xs font-semibold text-indigo-700">{step.charAt(0)}</span>
              <span className="text-xs text-indigo-500 ml-0.5">{step.slice(1)}</span>
            </div>
          ))}
        </div>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={
          isBehavioral
            ? "Structure your answer:\n\nSituation: Describe the context...\nTask: What was your specific responsibility?\nAction: What steps did YOU take?\nResult: What was the outcome? Quantify if possible."
            : "Write your answer here..."
        }
        rows={8}
        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 resize-none disabled:bg-slate-50 disabled:text-slate-500"
      />
      <div className="flex justify-between text-xs">
        <span className={charCount < 100 ? "text-orange-500" : "text-slate-400"}>
          {charCount} characters
          {charCount < 100 && " (aim for more detail)"}
        </span>
        <span className="text-slate-400">Recommended: {recommended}+</span>
      </div>
    </div>
  );
}
