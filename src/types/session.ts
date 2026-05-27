/**
 * Types for the recipe-style 5-question session flow.
 *
 * Separate from the round-based loop in src/types/index.ts. The session
 * flow is: upload CV → paste JD → answer 5 personalized voice-driven
 * questions → see a summary. State lives in sessionStorage so a refresh
 * doesn't discard an in-progress interview.
 */

export type SessionStatus =
  | "setup" // CV / JD upload form
  | "loading_questions" // /api/start-interview in flight
  | "active" // showing question, playing audio
  | "recording" // mic on, capturing answer
  | "grading" // /api/grade in flight
  | "reviewing" // showing grade
  | "summarizing" // /api/summary in flight
  | "complete" // show summary
  | "error";

import type { Round } from "./index";

export interface SessionQuestion {
  id: string;
  text: string;
  category: "behavioral" | "role-specific" | "technical";
  rationale: string;
  targetSeconds: number;
  /**
   * Interview-loop stage. When the candidate picked the question from the
   * bank, this maps to the 7-round taxonomy in src/lib/rounds.ts and
   * activates the round-specific grading rubric. Optional because
   * AI-generated questions don't always map cleanly to one round.
   */
  stage?: Round;
}

export interface SessionAnswer {
  questionId: string;
  transcript: string;
  durationMs?: number;
  wordsPerMinute?: number;
  fillerCount?: number;
  inTargetWindow?: boolean;
  pacingFeedback?: string;
}

export interface SessionGrade {
  score: number;
  strengths: string[];
  improvements: string[];
  strongerRephrase: string;
}

export interface SessionSummary {
  overallScore: number;
  topThreeTweaks: string[];
  encouragement: string;
}

export interface SessionState {
  status: SessionStatus;
  cvText: string;
  cvFileName?: string;
  jdText: string;
  questions: SessionQuestion[];
  currentIndex: number;
  answers: Record<string, SessionAnswer>;
  grades: Record<string, SessionGrade>;
  summary: SessionSummary | null;
  error: string | null;
}

export interface ClientConfig {
  voiceId: string;
  elevenlabsAvailable: boolean;
  whisperAvailable: boolean;
  anthropicConfigured: boolean;
  liveavatarAvailable?: boolean;
}
