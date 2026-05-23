import { NextResponse } from "next/server";
import { chatCompletion, MODEL_CONFIG, extractJSON } from "@/lib/anthropic";
import {
  sessionContextBlock,
  summarySystem,
  summaryUser,
  type SummaryGradeInput,
} from "@/lib/session-prompts";

interface SummaryResult {
  overallScore: number;
  topThreeTweaks: string[];
  encouragement: string;
}

/**
 * POST /api/summary
 *
 * Body:
 *   {
 *     cvText: string,
 *     jdText: string,
 *     grades: SummaryGradeInput[]
 *   }
 *
 * Returns: SummaryResult
 *
 * Final call of the session. Reads the CV + JD context from cache, then
 * passes the 5 per-question grades as the user message.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cvText, jdText, grades } = body as {
      cvText?: string;
      jdText?: string;
      grades?: SummaryGradeInput[];
    };

    if (!cvText || !jdText) {
      return NextResponse.json(
        { error: "cvText and jdText are required (the session context)." },
        { status: 400 },
      );
    }
    if (!Array.isArray(grades) || grades.length === 0) {
      return NextResponse.json(
        { error: "grades array is required (one entry per graded question)." },
        { status: 400 },
      );
    }

    const text = await chatCompletion({
      messages: [
        { role: "system", content: summarySystem() },
        { role: "system", content: sessionContextBlock({ cvText, jdText }) },
        { role: "user", content: summaryUser(grades) },
      ],
      cacheSystem: [false, true],
      max_tokens: MODEL_CONFIG.summary.maxTokens,
      temperature: MODEL_CONFIG.summary.temperature,
    });

    const summary = extractJSON(text) as SummaryResult;
    return NextResponse.json(summary);
  } catch (error) {
    console.error("summary error:", error);
    return NextResponse.json({ error: "Failed to summarize session" }, { status: 502 });
  }
}
