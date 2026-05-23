import { NextResponse } from "next/server";
import { chatCompletion, MODEL_CONFIG, extractJSON } from "@/lib/anthropic";
import {
  sessionContextBlock,
  startInterviewSystem,
  startInterviewUser,
} from "@/lib/session-prompts";

interface SessionQuestion {
  id: string;
  text: string;
  category: "behavioral" | "role-specific" | "technical";
  rationale: string;
  targetSeconds: number;
}

/**
 * POST /api/start-interview
 *
 * Body:
 *   { cvText: string, jdText: string }
 *
 * Returns:
 *   { questions: SessionQuestion[] }
 *
 * The CV + JD context is sent as a cacheable system block, so the four
 * subsequent /api/grade calls and the final /api/summary read it from
 * cache at ~10% of the token cost.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cvText, jdText } = body as { cvText?: string; jdText?: string };

    if (!cvText || cvText.trim().length < 100) {
      return NextResponse.json(
        { error: "CV text is required (at least 100 characters)." },
        { status: 400 },
      );
    }
    if (!jdText || jdText.trim().length < 100) {
      return NextResponse.json(
        { error: "Job description is required (at least 100 characters)." },
        { status: 400 },
      );
    }

    const text = await chatCompletion({
      messages: [
        { role: "system", content: startInterviewSystem() },
        { role: "system", content: sessionContextBlock({ cvText, jdText }) },
        { role: "user", content: startInterviewUser() },
      ],
      cacheSystem: [false, true],
      max_tokens: MODEL_CONFIG.sessionStart.maxTokens,
      temperature: MODEL_CONFIG.sessionStart.temperature,
    });

    const parsed = extractJSON(text) as { questions?: SessionQuestion[] };
    if (!parsed.questions?.length) {
      return NextResponse.json(
        { error: "No questions generated. The grader returned an unexpected shape." },
        { status: 502 },
      );
    }
    return NextResponse.json({ questions: parsed.questions });
  } catch (error) {
    console.error("start-interview error:", error);
    if (error instanceof Error && error.message.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Failed to start interview" },
      { status: 502 },
    );
  }
}
