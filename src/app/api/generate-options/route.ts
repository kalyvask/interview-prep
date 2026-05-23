import { NextResponse } from "next/server";
import { chatCompletion, MODEL_CONFIG, extractJSON } from "@/lib/anthropic";
import { optionsGenerationSystem, optionsGenerationUser } from "@/lib/prompts";
import type { MCOption } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question } = body;

    if (!question?.text) {
      return NextResponse.json({ error: "Missing question text" }, { status: 400 });
    }

    const text = await chatCompletion({
      messages: [
        { role: "system", content: optionsGenerationSystem() },
        { role: "user", content: optionsGenerationUser(question.text) },
      ],
      max_tokens: MODEL_CONFIG.optionGeneration.maxTokens,
      temperature: MODEL_CONFIG.optionGeneration.temperature,
    });

    const allOptions = extractJSON(text) as MCOption[];

    const clientOptions = allOptions.map(({ id, text: t }) => ({
      id,
      text: t,
    }));

    return NextResponse.json({
      options: clientOptions,
      _serverOptions: allOptions,
    });
  } catch (error) {
    console.error("generate-options error:", error);
    return NextResponse.json({ error: "Failed to generate options" }, { status: 502 });
  }
}
