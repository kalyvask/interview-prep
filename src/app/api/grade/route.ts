import { NextResponse } from "next/server";
import { chatCompletion, MODEL_CONFIG, extractJSON } from "@/lib/anthropic";
import {
  sessionContextBlock,
  gradeSystem,
  gradeUser,
} from "@/lib/session-prompts";
import type { Round } from "@/types";

interface Grade {
  score: number;
  strengths: string[];
  improvements: string[];
  strongerRephrase: string;
}

/**
 * POST /api/grade
 *
 * Body:
 *   {
 *     cvText?: string,         // optional in pick mode; falls back to a generic prompt
 *     jdText?: string,         // optional in pick mode
 *     question: { text: string, stage?: Round },
 *     answer: string,
 *   }
 *
 * Returns: Grade
 *
 * The CV + JD context is the cacheable system block. The question and
 * answer are sent as the user message and are NOT cached. When the
 * question has a stage (from the bank picker), the round-specific
 * rubric from src/lib/rounds.ts is layered into the grading prompt.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cvText = "", jdText = "", question, answer } = body as {
      cvText?: string;
      jdText?: string;
      question?: { text: string; stage?: Round };
      answer?: string;
    };

    if (!question?.text || !answer) {
      return NextResponse.json(
        { error: "Missing question or answer." },
        { status: 400 },
      );
    }

    const text = await chatCompletion({
      messages: [
        { role: "system", content: gradeSystem(question.stage) },
        { role: "system", content: sessionContextBlock({ cvText, jdText }) },
        { role: "user", content: gradeUser(question.text, answer) },
      ],
      cacheSystem: [false, true],
      max_tokens: MODEL_CONFIG.answerEvaluation.maxTokens,
      temperature: MODEL_CONFIG.answerEvaluation.temperature,
    });

    const grade = extractJSON(text) as Grade;
    return NextResponse.json(grade);
  } catch (error) {
    console.error("grade error:", error);
    return NextResponse.json({ error: "Failed to grade answer" }, { status: 502 });
  }
}
