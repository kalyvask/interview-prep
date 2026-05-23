import { NextResponse } from "next/server";
import { chatCompletion, MODEL_CONFIG, extractJSON } from "@/lib/anthropic";
import { followUpSystem, followUpUser } from "@/lib/prompts";
import { detectUncertaintySignals, shouldPushFollowUp } from "@/lib/uncertainty";
import type { FollowUpTurn } from "@/types";

/**
 * POST /api/follow-up
 *
 * Body:
 *   {
 *     questionId: string,
 *     originalQuestion: string,
 *     candidateAnswer: string,     // the most recent answer in the chain
 *     priorTurns: FollowUpTurn[],  // previous follow-up turns (oldest first)
 *   }
 *
 * Response:
 *   - 200 { pushNext: false, uncertainty }: no follow-up needed (all signals present or 3 pushes exhausted)
 *   - 200 { pushNext: true, turn: FollowUpTurn, uncertainty }: a follow-up turn was generated
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { questionId, originalQuestion, candidateAnswer, priorTurns } = body as {
      questionId: string;
      originalQuestion: string;
      candidateAnswer: string;
      priorTurns: FollowUpTurn[];
    };

    if (!questionId || !originalQuestion || !candidateAnswer) {
      return NextResponse.json(
        { error: "Missing questionId, originalQuestion, or candidateAnswer" },
        { status: 400 },
      );
    }

    const uncertainty = detectUncertaintySignals(candidateAnswer);
    const priorPushes = Array.isArray(priorTurns) ? priorTurns.length : 0;
    const decision = shouldPushFollowUp(uncertainty, priorPushes);

    if (!decision.push) {
      return NextResponse.json({ pushNext: false, uncertainty });
    }

    const raw = await chatCompletion({
      messages: [
        { role: "system", content: followUpSystem(decision.missing) },
        { role: "user", content: followUpUser(originalQuestion, candidateAnswer) },
      ],
      max_tokens: 600,
      temperature: 0.6,
    });

    let parsed: { pushQuestion?: string; pushReason?: string };
    try {
      parsed = extractJSON(raw) as { pushQuestion?: string; pushReason?: string };
    } catch {
      parsed = { pushQuestion: undefined, pushReason: undefined };
    }
    if (!parsed.pushQuestion) {
      // LLM didn't produce a question; bail out cleanly.
      return NextResponse.json({ pushNext: false, uncertainty });
    }

    const turn: FollowUpTurn = {
      id: `fu_${questionId}_${priorPushes + 1}`,
      questionId,
      pushQuestion: parsed.pushQuestion,
      pushReason: parsed.pushReason || `Pushing on missing: ${decision.missing.join(", ")}`,
    };

    return NextResponse.json({ pushNext: true, turn, uncertainty });
  } catch (error) {
    console.error("follow-up error:", error);
    return NextResponse.json({ error: "Failed to generate follow-up" }, { status: 502 });
  }
}
