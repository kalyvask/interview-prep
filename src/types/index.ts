export type QuestionCategory = "behavioral" | "case" | "situational";
export type Difficulty = "easy" | "medium" | "hard";
export type AnswerMode = "freetext" | "multiplechoice" | "voice";
export type SessionStatus = "setup" | "active" | "reviewing" | "complete";
export type FrameworkType = "STAR" | "structured" | "open";
export type OptionQuality = "excellent" | "good" | "mediocre" | "poor";
export type OptionId = "A" | "B" | "C" | "D";

/**
 * Interview-loop rounds. Names match the rounds described in the Codex prep
 * doc (section 4). Each round has its own system prompt, question style, and
 * evaluation rubric (see src/lib/rounds.ts).
 */
export type Round =
  | "recruiter"
  | "hiring_manager"
  | "product_sense"
  | "execution_metrics"
  | "technical_dasme"
  | "stakeholder_gtm"
  | "behavioral_values";

export type SessionMode = "standard" | "jd" | "round" | "loop";

export interface SessionConfig {
  mode: SessionMode;
  // standard mode
  category?: QuestionCategory;
  difficulty?: Difficulty;
  // round mode
  round?: Round;
  // loop mode
  rounds?: Round[];
  // shared options
  adversarial?: boolean;
  voiceEnabled?: boolean;
  questionCount: number;
  // jd mode
  jdText?: string;
  jdExtractedSkills?: string[];
  jdExtractedRequirements?: string[];
  jdCompanyContext?: string;
}

export interface Question {
  id: string;
  text: string;
  category: QuestionCategory;
  difficulty: Difficulty;
  expectedFramework: FrameworkType;
  hints: string[];
  relevantSkill?: string;
  round?: Round;
}

export interface FreeTextAnswer {
  type: "freetext";
  text: string;
  voice?: VoiceCapture;
}

export interface MultipleChoiceAnswer {
  type: "multiplechoice";
  selectedOptionId: OptionId;
}

export type UserAnswer = FreeTextAnswer | MultipleChoiceAnswer;

export interface MCOption {
  id: OptionId;
  text: string;
  quality: OptionQuality;
}

export interface STARScore {
  situation: { score: number; feedback: string; present: boolean };
  task: { score: number; feedback: string; present: boolean };
  action: { score: number; feedback: string; present: boolean };
  result: { score: number; feedback: string; present: boolean };
}

export interface RoundRubricScore {
  dimension: string;
  score: number;
  feedback: string;
}

export interface UncertaintyCheck {
  hasRisk: boolean;
  hasFalsifier: boolean;
  hasGuardrail: boolean;
  detectedRisk?: string;
  detectedFalsifier?: string;
  detectedGuardrail?: string;
  summary: string;
}

export interface FreeTextEvaluation {
  type: "freetext";
  overallScore: number;
  frameworkScore: STARScore | null;
  roundScores?: RoundRubricScore[];
  uncertainty?: UncertaintyCheck;
  strengths: string[];
  improvements: string[];
  detailedFeedback: string;
  suggestedAnswer: string;
  relevanceToRole: string;
  round?: Round;
}

export interface MCEvaluation {
  type: "multiplechoice";
  correct: boolean;
  selectedQuality: OptionQuality;
  bestOptionId: OptionId;
  explanation: string;
  whySelected: string;
  learningPoint: string;
}

export type Evaluation = FreeTextEvaluation | MCEvaluation;

/**
 * Adversarial follow-up turn. After the candidate's main answer, the
 * interviewer pushes back until the candidate names risk / falsifier /
 * guardrail. Up to 3 turns per question.
 */
export interface FollowUpTurn {
  id: string;
  questionId: string;
  pushQuestion: string;
  pushReason: string; // why the interviewer is pushing (missing risk, missing falsifier, etc.)
  answer?: string;
  uncertaintyAfter?: UncertaintyCheck;
}

export interface VoiceCapture {
  durationMs: number;
  wordsPerMinute?: number;
  fillerCount?: number;
  fillerWords?: string[];
  targetWindowSec?: number;
  inTargetWindow?: boolean;
  pacingFeedback?: string;
}

/**
 * Per-round mention of a story / fact. Used for cumulative consistency
 * scoring in loop mode (catching story drift across rounds).
 */
export interface StoryMention {
  round: Round;
  questionId: string;
  storyKey: string; // e.g. "amazon_ml_ordering"
  facts: Record<string, string>; // e.g. { savings: "$64M", countries: "8" }
  excerpt: string;
}

export interface StoryDriftEntry {
  storyKey: string;
  fact: string;
  values: { round: Round; value: string; questionId: string }[];
}

export interface ConsistencyReport {
  drifts: StoryDriftEntry[];
  consistencyScore: number; // 0-100
  summary: string;
}

export interface LoopState {
  rounds: Round[];
  currentRoundIndex: number;
  perRoundQuestionIds: Record<Round, string[]>;
  perRoundTotals: Record<string, number>;
  storyMentions: StoryMention[];
  consistency?: ConsistencyReport;
}

export interface InterviewSession {
  config: SessionConfig;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, UserAnswer>;
  evaluations: Record<string, Evaluation>;
  followUps: Record<string, FollowUpTurn[]>; // questionId -> turns (oldest first)
  answerMode: AnswerMode;
  mcOptions: Record<string, MCOption[]>;
  status: SessionStatus;
  isLoading: boolean;
  error: string | null;
  loop?: LoopState;
}
