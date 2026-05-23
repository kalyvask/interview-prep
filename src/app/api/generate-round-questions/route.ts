import { NextResponse } from "next/server";
import { chatCompletion, MODEL_CONFIG, extractJSON } from "@/lib/anthropic";
import { roundQuestionGenerationSystem, roundQuestionGenerationUser } from "@/lib/prompts";
import { getRound } from "@/lib/rounds";
import type { Question, Round } from "@/types";

const VALID_ROUNDS: Round[] = [
  "recruiter",
  "hiring_manager",
  "product_sense",
  "execution_metrics",
  "technical_dasme",
  "stakeholder_gtm",
  "behavioral_values",
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { round, count, previousQuestions } = body as {
      round: Round;
      count?: number;
      previousQuestions?: string[];
    };

    if (!round || !VALID_ROUNDS.includes(round)) {
      return NextResponse.json(
        { error: `Missing or invalid round. Choices: ${VALID_ROUNDS.join(", ")}` },
        { status: 400 },
      );
    }

    const def = getRound(round);
    const finalCount = count && count > 0 ? count : def.defaultCount;

    const text = await chatCompletion({
      messages: [
        { role: "system", content: roundQuestionGenerationSystem(round) },
        {
          role: "user",
          content: roundQuestionGenerationUser(round, finalCount, previousQuestions),
        },
      ],
      max_tokens: MODEL_CONFIG.questionGeneration.maxTokens,
      temperature: MODEL_CONFIG.questionGeneration.temperature,
    });

    const raw = extractJSON(text) as Question[];
    // Stamp the round onto each question so downstream code knows which rubric to use
    const questions = raw.map((q) => ({ ...q, round }));
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("generate-round-questions error:", error);
    if (error instanceof Error && error.message.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }
    return NextResponse.json({ error: "Failed to generate round questions" }, { status: 502 });
  }
}
