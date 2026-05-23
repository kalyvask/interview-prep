import { NextResponse } from "next/server";
import { chatCompletion, MODEL_CONFIG, extractJSON } from "@/lib/anthropic";
import { questionGenerationSystem, questionGenerationUser } from "@/lib/prompts";
import type { Question } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, difficulty, count = 5, previousQuestions } = body;

    if (!category || !difficulty) {
      return NextResponse.json({ error: "Missing category or difficulty" }, { status: 400 });
    }

    const text = await chatCompletion({
      messages: [
        { role: "system", content: questionGenerationSystem() },
        { role: "user", content: questionGenerationUser(category, difficulty, count, previousQuestions) },
      ],
      max_tokens: MODEL_CONFIG.questionGeneration.maxTokens,
      temperature: MODEL_CONFIG.questionGeneration.temperature,
    });

    const questions = extractJSON(text) as Question[];
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("generate-questions error:", error);
    if (error instanceof Error && error.message.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 502 });
  }
}
