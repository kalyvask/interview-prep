"use client";

import { useState } from "react";
import type { Question } from "@/types";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/constants";

export default function QuestionCard({ question }: { question: Question }) {
  const [showHints, setShowHints] = useState(false);

  const difficultyColor =
    question.difficulty === "easy"
      ? "bg-green-100 text-green-800"
      : question.difficulty === "medium"
        ? "bg-yellow-100 text-yellow-800"
        : "bg-red-100 text-red-800";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 animate-fade-in">
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${CATEGORY_COLORS[question.category]}`}>
          {CATEGORY_LABELS[question.category]}
        </span>
        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${difficultyColor}`}>
          {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
        </span>
        {question.expectedFramework === "STAR" && (
          <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-100 text-indigo-800">
            STAR
          </span>
        )}
        {question.relevantSkill && (
          <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
            {question.relevantSkill}
          </span>
        )}
      </div>

      <p className="text-lg font-medium text-slate-900 leading-relaxed">{question.text}</p>

      {question.hints.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowHints(!showHints)}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            {showHints ? "Hide hints" : "Show hints"}
          </button>
          {showHints && (
            <ul className="mt-2 space-y-1">
              {question.hints.map((hint, i) => (
                <li key={i} className="text-sm text-slate-500 flex items-start gap-2">
                  <span className="text-indigo-400 mt-0.5">&#8226;</span>
                  {hint}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
