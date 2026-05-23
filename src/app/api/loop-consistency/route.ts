import { NextResponse } from "next/server";
import { buildConsistencyReport, extractMentions } from "@/lib/consistency";
import type { Round, StoryMention } from "@/types";

/**
 * POST /api/loop-consistency
 *
 * Body:
 *   {
 *     answers: Array<{ round: Round, questionId: string, answer: string }>
 *   }
 *
 * Walks each answer through the story extractors and returns a consistency
 * report (drifts + score). Stateless; the client passes in everything.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const answers = (body?.answers ?? []) as Array<{
      round: Round;
      questionId: string;
      answer: string;
    }>;

    const mentions: StoryMention[] = [];
    for (const a of answers) {
      mentions.push(...extractMentions(a.round, a.questionId, a.answer));
    }
    const report = buildConsistencyReport(mentions);
    return NextResponse.json({ mentions, report });
  } catch (error) {
    console.error("loop-consistency error:", error);
    return NextResponse.json({ error: "Failed to compute consistency" }, { status: 502 });
  }
}
