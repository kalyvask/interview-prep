"use client";

import type { OptionId } from "@/types";

interface ClientOption {
  id: OptionId;
  text: string;
}

interface Props {
  options: ClientOption[];
  selected: OptionId | null;
  onSelect: (id: OptionId) => void;
  disabled?: boolean;
}

export default function MultipleChoiceAnswer({ options, selected, onSelect, disabled }: Props) {
  return (
    <div className="space-y-3">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onSelect(opt.id)}
          disabled={disabled}
          className={`w-full text-left p-4 rounded-xl border transition-all ${
            selected === opt.id
              ? "border-indigo-300 bg-indigo-50 ring-1 ring-indigo-300"
              : "border-slate-200 hover:border-slate-300 disabled:hover:border-slate-200"
          } disabled:opacity-60`}
        >
          <div className="flex items-start gap-3">
            <span
              className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                selected === opt.id
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-300 text-slate-400"
              }`}
            >
              {opt.id}
            </span>
            <p className="text-sm text-slate-700 leading-relaxed">{opt.text}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
