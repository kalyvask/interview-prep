import { NextResponse } from "next/server";
import { chatCompletion, MODEL_CONFIG, extractJSON } from "@/lib/anthropic";
import { choiceEvaluationSystem, choiceEvaluationUser } from "@/lib/prompts";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question, selectedOptionId, options } = body;

    if (!question?.text || !selectedOptionId || !options?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const text = await chatCompletion({
      messages: [
        { role: "system", content: choiceEvaluationSystem() },
        { role: "user", content: choiceEvaluationUser(question.text, selectedOptionId, options) },
      ],
      max_tokens: MODEL_CONFIG.answerEvaluation.maxTokens,
      temperature: MODEL_CONFIG.answerEvaluation.temperature,
    });

    const result = extractJSON(text);
    return NextResponse.json(result);
  } catch (error) {
    console.error("evaluate-choice error:", error);
    return NextResponse.json({ error: "Failed to evaluate choice" }, { status: 502 });
  }
}
