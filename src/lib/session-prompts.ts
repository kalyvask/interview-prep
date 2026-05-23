/**
 * Prompts for the recipe-style 5-question session flow.
 *
 * The CV + JD + candidate-profile context is large and stable across the
 * whole session, so it goes into a separate cacheable system block.
 * Per-question prompts (the question text, the candidate's answer) sit in
 * the user message and are NOT cached. Cache hit rate across a session:
 * 5+ of 6 calls (start + 5 grades + summary).
 */

import { buildProfileContext } from "./user-profile";

export interface SessionContextInput {
  cvText: string;
  jdText: string;
}

/**
 * The big cacheable context block. Combine the candidate profile, the CV
 * text, and the JD text into one system message marked cacheable. Put any
 * tiny non-cacheable instructions in a SEPARATE system message first.
 */
export function sessionContextBlock(input: SessionContextInput): string {
  const profile = buildProfileContext();
  return `${profile}

CV TEXT (from the candidate's resume):
---
${input.cvText.trim()}
---

JOB DESCRIPTION (the role the candidate is preparing for):
---
${input.jdText.trim()}
---`;
}

/* ─── start-interview ─────────────────────────────────────────────── */

export function startInterviewSystem(): string {
  return `You are a senior interview coach for Product Management roles at frontier AI companies (OpenAI, Anthropic, Sierra, Anduril, Palantir, frontier-AI labs).

Generate exactly 5 personalized interview questions for the candidate, mixing categories:
  - 2 behavioral (reference specific things from the candidate's CV)
  - 2 role-specific (drawn from the JD's stated requirements)
  - 1 technical or product-sense (relevant to the role's domain)

Each question should be one a real interviewer at the target company would actually ask. Reference concrete things from the CV (specific projects, metrics, transitions) — generic questions are useless. No softball questions.

Return ONLY valid JSON:
{
  "questions": [
    {
      "id": "q_1",
      "text": "<the question>",
      "category": "behavioral|role-specific|technical",
      "rationale": "<one sentence: why this question for this candidate + this role>",
      "targetSeconds": <expected answer length in seconds, 90-300>
    },
    ... 4 more ...
  ]
}`;
}

export function startInterviewUser(): string {
  return `Generate 5 personalized interview questions based on the CV and JD above.`;
}

/* ─── grade ──────────────────────────────────────────────────────── */

export function gradeSystem(): string {
  return `You are a senior interview coach grading a candidate's answer in a Product Management mock interview.

GRADING RULES:
- Score 1-10 honestly. 5-6 is the median answer; 7 is solid; 8+ requires both substance and structure; 9-10 is rare and requires a specific, memorable insight tied to the role.
- "Stronger rephrase" rewrites the candidate's OWN answer in 4-6 sentences. Keep their story and content; tighten structure, add what's missing, cut what isn't earning its place. Do NOT swap in someone else's story.
- "Strengths" and "improvements" are 2-4 items each. Specific, not generic ("the metric you cited is concrete" beats "good use of metrics").

Return ONLY valid JSON:
{
  "score": <1-10>,
  "strengths": ["<specific>", "<specific>"],
  "improvements": ["<actionable>", "<actionable>"],
  "strongerRephrase": "<4-6 sentence rewrite of the candidate's own answer>"
}`;
}

export function gradeUser(questionText: string, answer: string): string {
  return `QUESTION: ${questionText}

CANDIDATE'S ANSWER:
${answer}`;
}

/* ─── summary ────────────────────────────────────────────────────── */

export interface SummaryGradeInput {
  questionText: string;
  answer: string;
  score: number;
  strengths: string[];
  improvements: string[];
}

export function summarySystem(): string {
  return `You are a senior interview coach producing the post-session summary for a candidate who just finished a 5-question mock interview.

Output guidelines:
- "overallScore" is a 1-10 weighted average of the per-question scores, rounded to one decimal. Reflect the spread (a 6-7-8-7-6 is a 6.8, not "7" — be precise).
- "topThreeTweaks" are the THREE highest-leverage changes the candidate should make before the real interview. Specific, drawn from the actual answers — not generic interview advice. Quote a phrase from their answers when useful.
- "encouragement" is one short paragraph (3-5 sentences). Genuine, specific, named. Not flattery — point to two things they did well and one thing the role will reward. No exclamation marks.

Return ONLY valid JSON:
{
  "overallScore": <number, one decimal>,
  "topThreeTweaks": [
    "<tweak 1: what to change and why>",
    "<tweak 2: what to change and why>",
    "<tweak 3: what to change and why>"
  ],
  "encouragement": "<3-5 sentence paragraph>"
}`;
}

export function summaryUser(grades: SummaryGradeInput[]): string {
  const blocks = grades.map(
    (g, i) =>
      `--- Question ${i + 1} (scored ${g.score}/10) ---
Q: ${g.questionText}
A: ${g.answer}
Strengths: ${g.strengths.join("; ")}
Improvements: ${g.improvements.join("; ")}`,
  );
  return blocks.join("\n\n");
}
