"use client";

import { ROUNDS } from "@/lib/rounds";
import type { Round } from "@/types";

interface LoopRoundsPickerProps {
  selected: Round[];
  onChange: (rounds: Round[]) => void;
  disabled?: boolean;
}

export default function LoopRoundsPicker({ selected, onChange, disabled }: LoopRoundsPickerProps) {
  function toggle(round: Round) {
    if (disabled) return;
    if (selected.includes(round)) {
      onChange(selected.filter((r) => r !== round));
    } else {
      onChange([...selected, round]);
    }
  }
  return (
    <div className="space-y-2">
      {ROUNDS.map((r) => {
        const checked = selected.includes(r.value);
        const order = selected.indexOf(r.value);
        return (
          <label
            key={r.value}
            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              checked
                ? "border-indigo-300 bg-indigo-50"
                : "border-slate-200 hover:border-slate-300"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(r.value)}
              disabled={disabled}
              className="mt-1 accent-indigo-600"
            />
            <span className="flex-1">
              <span className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-semibold text-slate-900">{r.label}</span>
                {checked && (
                  <span className="text-xs font-medium text-indigo-700">
                    #{order + 1} in sequence
                  </span>
                )}
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">{r.short}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}
