import { chatCompletionStream, MODEL_CONFIG, extractJSON } from "@/lib/anthropic";
import { evaluationSystem, evaluationUser } from "@/lib/prompts";
import { detectUncertaintySignals } from "@/lib/uncertainty";
import type { Round } from "@/types";

/**
 * POST /api/evaluate-answer
 *
 * Streams the grader's response back to the client as SSE so the UI can
 * render the analysis as it's written. The deterministic uncertainty
 * heuristic (risk / falsifier / guardrail regex) is computed up-front
 * and merged into the final evaluation as a sidecar.
 *
 * Client-facing SSE shape:
 *   data: {"text": "<token chunk>"}
 *   ... repeated ...
 *   data: {"done": true, "evaluation": {...} }
 *   on error: data: {"error": "..."}
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question, answer, jobContext } = body as {
      question: { text: string; category: string; round?: Round };
      answer: string;
      jobContext?: string;
    };

    if (!question?.text || !answer) {
      return new Response(
        JSON.stringify({ error: "Missing question or answer" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const uncertaintyHeuristic = detectUncertaintySignals(answer);

    const encoder = new TextEncoder();
    let fullText = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          const stream = chatCompletionStream({
            messages: [
              {
                role: "system",
                content: evaluationSystem(question.category, question.round),
              },
              {
                role: "user",
                content: evaluationUser(question.text, answer, jobContext),
              },
            ],
            max_tokens: MODEL_CONFIG.answerEvaluation.maxTokens,
            temperature: MODEL_CONFIG.answerEvaluation.temperature,
          });

          for await (const chunk of stream) {
            fullText += chunk;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`),
            );
          }

          try {
            const parsed = extractJSON(fullText) as Record<string, unknown>;
            const llmUncertainty = parsed.uncertainty as
              | {
                  hasRisk?: boolean;
                  hasFalsifier?: boolean;
                  hasGuardrail?: boolean;
                  summary?: string;
                }
              | undefined;
            const merged = llmUncertainty
              ? {
                  hasRisk: llmUncertainty.hasRisk ?? uncertaintyHeuristic.hasRisk,
                  hasFalsifier:
                    llmUncertainty.hasFalsifier ?? uncertaintyHeuristic.hasFalsifier,
                  hasGuardrail:
                    llmUncertainty.hasGuardrail ?? uncertaintyHeuristic.hasGuardrail,
                  detectedRisk: uncertaintyHeuristic.detectedRisk,
                  detectedFalsifier: uncertaintyHeuristic.detectedFalsifier,
                  detectedGuardrail: uncertaintyHeuristic.detectedGuardrail,
                  summary: llmUncertainty.summary || uncertaintyHeuristic.summary,
                }
              : uncertaintyHeuristic;
            parsed.uncertainty = merged;
            if (question.round) parsed.round = question.round;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ done: true, evaluation: parsed })}\n\n`,
              ),
            );
          } catch {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  done: true,
                  rawText: fullText,
                  uncertainty: uncertaintyHeuristic,
                })}\n\n`,
              ),
            );
          }
          controller.close();
        } catch (err) {
          console.error("Stream error:", err);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`,
            ),
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("evaluate-answer error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to evaluate answer" }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }
}
