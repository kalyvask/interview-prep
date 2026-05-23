import type { QuestionCategory, Difficulty } from "@/types";

export const CATEGORIES: { value: QuestionCategory; label: string; description: string }[] = [
  {
    value: "behavioral",
    label: "Behavioral (STAR)",
    description: "Past experience questions evaluated against the STAR framework",
  },
  {
    value: "case",
    label: "Case / Open-Ended",
    description: "Product strategy and business scenario questions",
  },
  {
    value: "situational",
    label: "Situational Judgment",
    description: "Hypothetical scenarios testing decision-making",
  },
];

export const DIFFICULTIES: { value: Difficulty; label: string; color: string }[] = [
  { value: "easy", label: "Easy", color: "bg-green-100 text-green-800" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  { value: "hard", label: "Hard", color: "bg-red-100 text-red-800" },
];

export const CATEGORY_COLORS: Record<QuestionCategory, string> = {
  behavioral: "bg-blue-100 text-blue-800",
  case: "bg-purple-100 text-purple-800",
  situational: "bg-orange-100 text-orange-800",
};

export const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  behavioral: "Behavioral",
  case: "Case",
  situational: "Situational",
};
