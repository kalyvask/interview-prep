"use client";

import { ROUNDS } from "@/lib/rounds";
import type { Round } from "@/types";

interface RoundPickerProps {
  selected: Round | null;
  onSelect: (round: Round) => void;
  disabled?: boolean;
}

export default function RoundPicker({ selected, onSelect, disabled }: RoundPickerProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {ROUNDS.map((r) => {
        const active = selected === r.value;
        return (
          <button
            key={r.value}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(r.value)}
            className={`text-left p-4 rounded-xl border transition-all ${
              active
                ? "border-indigo-300 bg-indigo-50 ring-1 ring-indigo-300"
                : "border-slate-200 hover:border-slate-300"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-semibold text-slate-900">{r.label}</span>
              <span className="text-xs text-slate-400">{r.targetWindowSec}s target</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{r.short}</p>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">{r.description}</p>
          </button>
        );
      })}
    </div>
  );
}
