import { NextResponse } from "next/server";
import { chatCompletion, MODEL_CONFIG, extractJSON } from "@/lib/anthropic";
import { jdQuestionGenerationSystem, jdQuestionGenerationUser } from "@/lib/prompts";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { jobDescription, count = 5 } = body;

    if (!jobDescription || jobDescription.length < 50) {
      return NextResponse.json(
        { error: "Please provide a more detailed job description (at least 50 characters)" },
        { status: 400 }
      );
    }

    const text = await chatCompletion({
      messages: [
        { role: "system", content: jdQuestionGenerationSystem() },
        { role: "user", content: jdQuestionGenerationUser(jobDescription, count) },
      ],
      max_tokens: MODEL_CONFIG.questionGeneration.maxTokens,
      temperature: MODEL_CONFIG.questionGeneration.temperature,
    });

    const result = extractJSON(text);
    return NextResponse.json(result);
  } catch (error) {
    console.error("generate-jd-questions error:", error);
    return NextResponse.json({ error: "Failed to generate JD questions" }, { status: 502 });
  }
}
