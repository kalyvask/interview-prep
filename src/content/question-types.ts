/**
 * Shared question types — extracted so personal.ts can import without
 * creating a circular dependency with questions.ts.
 *
 * The public `Question` shape uses the closed `QuestionCategory` union.
 * The `ExtraQuestion` shape (used by personal-config extras) loosens
 * `category` to a plain string so personal extensions can introduce
 * their own categories without modifying the public union.
 */

import type { Round } from "@/types";

export type QuestionCategory =
  | "Customer-Facing AI Agents"
  | "Content + Recommendations"
  | "Search + Retrieval"
  | "Evaluation + Safety"
  | "Autonomous Agents + Workflows"
  | "Prediction + Analytics"
  | "AI Literacy"
  | "Cost + Unit Economics"
  | "AI Strategy"
  | "Product Sense Cases"
  | "Recruiter screen"
  | "Hiring manager"
  | "Execution + metrics"
  | "Stakeholder / GTM"
  | "Behavioral / values";

export type Stage = Round;

export interface Question {
  number: number;
  text: string;
  category: QuestionCategory;
  stage: Stage;
}

/**
 * Looser question shape used by the personal-config extras. Category is
 * a plain string so personal extensions can add their own categories
 * (e.g. "OpenAI Applied AI loop") without editing the public type. The
 * picker form and /questions explorer accept either shape.
 */
export interface ExtraQuestion {
  number: number;
  text: string;
  category: string;
  stage: Stage;
}
