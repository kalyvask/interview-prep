/**
 * Prompts for the recipe-style 5-question session flow.
 *
 * The CV + JD + candidate-profile context is large and stable across the
 * whole session, so it goes into a separate cacheable system block.
 * Per-question prompts (the question text, the candidate's answer) sit in
 * the user message and are NOT cached. Cache hit rate across a session:
 * 5+ of 6 calls (start + 5 grades + summary).
 *
 * The grader and question generator are anchored against real interview
 * material — paired 4/10-vs-9/10 calibration answers from
 * src/content/calibrations.ts and real system-design / product-sense
 * questions from src/content/questions.ts. Updating those files updates
 * the prompts automatically.
 */

import { buildProfileContext } from "./user-profile";
import { getRound } from "./rounds";
import { CALIBRATIONS } from "@/content/calibrations";
import { QUESTIONS } from "@/content/questions";
import type { Round } from "@/types";

/* ─── Calibration anchors (real coach-rated paired answers) ──────── */

function buildCalibrationAnchors(): string {
  // Pull the behavioral + system-design pair: covers the two most common
  // rounds and gives the grader concrete 3-4/10 vs 9/10 endpoints.
  const picks = CALIBRATIONS.filter(
    (c) => c.id === "tell-me-about-yourself" || c.id === "system-design-churn",
  );
  if (picks.length === 0) return "";
  const blocks = picks.map((c) => {
    const flaws = c.weak.flaws.map((f) => `   - ${f}`).join("\n");
    const strengths = c.strong.strengths.map((s) => `   - ${s}`).join("\n");
    return `Question: "${c.question}"

WEAK (${c.weak.score}):
"""
${c.weak.response}
"""
Why it scored ${c.weak.score}:
${flaws}

STRONG (${c.strong.score}):
"""
${c.strong.response}
"""
Why it scored ${c.strong.score}:
${strengths}`;
  });
  return blocks.join("\n\n———\n\n");
}

/* ─── Question shape examples (real interviewer questions) ───────── */

function buildQuestionShapeExamples(): string {
  // One representative question per category from the bank — keeps the
  // generator grounded in the shape real interviewers use (specific,
  // decision-forcing, named domain), not soft hypotheticals.
  const seen = new Set<string>();
  const picks: { category: string; text: string }[] = [];
  for (const q of QUESTIONS) {
    if (seen.has(q.category)) continue;
    seen.add(q.category);
    picks.push({ category: q.category, text: q.text });
  }
  return picks.map((p) => `  - [${p.category}] ${p.text}`).join("\n");
}

export interface SessionContextInput {
  cvText: string;
  jdText: string;
}

/**
 * The big cacheable context block. Combine the candidate profile, the CV
 * text, and the JD text into one system message marked cacheable. Put any
 * tiny non-cacheable instructions in a SEPARATE system message first.
 *
 * CV/JD are optional — in pick mode the candidate may drill questions
 * without uploading either. We render an explicit placeholder so the
 * grader knows to fall back to generic AI PM expectations.
 */
export function sessionContextBlock(input: SessionContextInput): string {
  const profile = buildProfileContext();
  const cv = input.cvText.trim()
    ? input.cvText.trim()
    : "(not provided — grade against generic AI PM expectations; do not invent CV details)";
  const jd = input.jdText.trim()
    ? input.jdText.trim()
    : "(not provided — grade against generic AI PM role expectations; do not invent JD requirements)";
  return `${profile}

CV TEXT (from the candidate's resume):
---
${cv}
---

JOB DESCRIPTION (the role the candidate is preparing for):
---
${jd}
---`;
}

/* ─── start-interview ─────────────────────────────────────────────── */

export function startInterviewSystem(): string {
  return `You are a senior interview coach for Product Management roles at frontier AI companies (OpenAI, Anthropic, Sierra, Anduril, Palantir, frontier-AI labs).

Generate exactly 5 personalized interview questions for the candidate, mixing categories:
  - 2 behavioral (reference specific things from the candidate's CV)
  - 2 role-specific (drawn from the JD's stated requirements)
  - 1 technical or product-sense (relevant to the role's domain)

QUESTION SHAPE — your generated questions must match the shape of real interviewer questions. Examples of questions real AI PMs were asked at top-tier loops (from the system-design question bank, one per category):

${buildQuestionShapeExamples()}

Notice the shape: specific named domain (financial-services, ChatGPT memory, 500M daily posts, 10x scale), decision-forcing prompts ("design", "architect", "build", "diagnose"), not soft hypotheticals. Your generated questions should feel like they were asked by an actual interviewer who read the CV and JD beforehand.

Reference concrete things from the CV (specific projects, metrics, transitions) — generic questions are useless. No softball questions.

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

function buildRoundRubric(stage: Round): string {
  const def = getRound(stage);
  const dims = def.rubric
    .map((r, i) => `   ${i + 1}. ${r.dimension} (0-${r.max}): ${r.description}`)
    .join("\n");
  return `ROUND CONTEXT — this question is from the "${def.label}" round (${def.short}).

${def.description}

ROUND-SPECIFIC RUBRIC (use this in addition to the calibration anchors below):
${dims}

Expected answer length: about ${def.targetWindowSec} seconds spoken.`;
}

export function gradeSystem(stage?: Round): string {
  const roundBlock = stage ? `${buildRoundRubric(stage)}\n\n` : "";
  return `You are a senior interview coach grading a candidate's answer in a Product Management mock interview.

${roundBlock}CALIBRATION ANCHORS — real coach-rated answers. Use these to anchor your scoring; do not invent your own scale.

${buildCalibrationAnchors()}

Notice the gap between the weak and strong answers: specificity, named architectures / metrics / dollar math, weakness-flipping, third-option thinking, time discipline. That's the gap between a 4 and a 9. Most real answers fall somewhere between — be honest about where this one lands.

GRADING RULES:
- Score 1-10 calibrated against the anchors above${stage ? " and the round-specific rubric" : ""}. 5-6 is the median answer; 7 is solid but missing one element a 9 would have; 8 is very strong; 9-10 is rare and requires the kind of specificity, third-option thinking, and weakness-flipping visible in the STRONG anchors.
- "Stronger rephrase" rewrites the candidate's OWN answer in 4-6 sentences. Keep their story and content; tighten structure, add what's missing, cut what isn't earning its place. Do NOT swap in someone else's story.
- "Strengths" and "improvements" are 2-4 items each. Specific, not generic ("the metric you cited is concrete" beats "good use of metrics"). When relevant, reference how the answer compares to the anchors (e.g., "named the architecture like the STRONG anchor, but missed the dollar math")${stage ? " or the round rubric (e.g., \"strong on action specificity, weak on STAR completeness\")" : ""}.

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
