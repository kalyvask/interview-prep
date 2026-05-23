"use client";

import { useState } from "react";
import type { FollowUpTurn, UncertaintyCheck } from "@/types";

interface AdversarialFollowUpProps {
  questionId: string;
  originalQuestion: string;
  initialAnswer: string;
  /** Existing follow-up turns (oldest first) */
  turns: FollowUpTurn[];
  /** Uncertainty check from the initial answer */
  uncertainty?: UncertaintyCheck;
  onTurnAdded: (turn: FollowUpTurn) => void;
  onTurnAnswered: (turnId: string, answer: string) => void;
}

export default function AdversarialFollowUp({
  questionId,
  originalQuestion,
  initialAnswer,
  turns,
  uncertainty,
  onTurnAdded,
  onTurnAnswered,
}: AdversarialFollowUpProps) {
  const [currentResponse, setCurrentResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const lastTurn = turns[turns.length - 1];
  const pendingTurn = lastTurn && !lastTurn.answer ? lastTurn : null;

  async function maybeRequestFirstPush() {
    if (turns.length > 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          originalQuestion,
          candidateAnswer: initialAnswer,
          priorTurns: [],
        }),
      });
      if (!res.ok) throw new Error("Follow-up request failed");
      const data = (await res.json()) as {
        pushNext: boolean;
        turn?: FollowUpTurn;
      };
      if (data.pushNext && data.turn) {
        onTurnAdded(data.turn);
      } else {
        setDone(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Follow-up failed");
    } finally {
      setLoading(false);
    }
  }

  // Trigger first push when component mounts and uncertainty signals are missing.
  if (
    turns.length === 0 &&
    !done &&
    !loading &&
    uncertainty &&
    !(uncertainty.hasRisk && uncertainty.hasFalsifier && uncertainty.hasGuardrail)
  ) {
    void maybeRequestFirstPush();
  }

  async function handleSubmitResponse() {
    if (!pendingTurn || currentResponse.trim().length < 10) return;
    onTurnAnswered(pendingTurn.id, currentResponse.trim());
    setCurrentResponse("");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          originalQuestion,
          candidateAnswer: currentResponse,
          priorTurns: turns.map((t) => ({ ...t, answer: t.id === pendingTurn.id ? currentResponse : t.answer })),
        }),
      });
      if (!res.ok) throw new Error("Follow-up request failed");
      const data = (await res.json()) as { pushNext: boolean; turn?: FollowUpTurn };
      if (data.pushNext && data.turn) {
        onTurnAdded(data.turn);
      } else {
        setDone(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Follow-up failed");
    } finally {
      setLoading(false);
    }
  }

  if (uncertainty?.hasRisk && uncertainty.hasFalsifier && uncertainty.hasGuardrail && turns.length === 0) {
    return (
      <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-4 text-sm text-emerald-800">
        Strong answer: risk, falsifier, and guardrail all named. No follow-up push needed.
      </div>
    );
  }

  return (
    <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-amber-900 uppercase tracking-wide">
          Adversarial follow-up
        </span>
        {uncertainty && (
          <span className="text-xs text-amber-800">{uncertainty.summary}</span>
        )}
      </div>

      {turns.map((turn) => (
        <div key={turn.id} className="space-y-2">
          <div className="bg-white border border-amber-200 rounded-lg p-3">
            <p className="text-xs uppercase tracking-wide text-amber-700 mb-1">
              Interviewer push ({turn.pushReason})
            </p>
            <p className="text-sm text-slate-900">{turn.pushQuestion}</p>
          </div>
          {turn.answer ? (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Your reply</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{turn.answer}</p>
            </div>
          ) : null}
        </div>
      ))}

      {pendingTurn && (
        <div className="space-y-2">
          <textarea
            value={currentResponse}
            onChange={(e) => setCurrentResponse(e.target.value)}
            placeholder="Defend the answer. Name the risk you're accepting, the signal that would tell you you're wrong, and the guardrail you'd monitor."
            rows={4}
            className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 resize-none"
          />
          <button
            type="button"
            disabled={loading || currentResponse.trim().length < 10}
            onClick={handleSubmitResponse}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-300 text-white text-sm font-medium rounded-lg"
          >
            {loading ? "Pushing back..." : "Reply"}
          </button>
        </div>
      )}

      {!pendingTurn && loading && (
        <div className="flex items-center gap-2 text-sm text-amber-800">
          <div className="w-4 h-4 border-2 border-amber-300 border-t-amber-700 rounded-full animate-spin" />
          Generating follow-up...
        </div>
      )}

      {done && (
        <p className="text-sm text-amber-900">
          Push round complete. You either named all three signals or hit the 3-turn cap. Move to the next question.
        </p>
      )}

      {error && (
        <p className="text-sm text-red-700">{error}</p>
      )}
    </div>
  );
}
