/**
 * Uncertainty-sentence detection.
 *
 * In frontier-AI PM loops the "uncertainty sentence" is the move that
 * separates merely-good answers from frontier-native ones: explicitly name
 * the risk you're accepting, the signal that would tell you you're wrong
 * (the falsifier), and the guardrail you'd monitor. See section 4.1 of the
 * Codex Deployed PM prep doc.
 *
 * Detection is two-stage:
 *   1. A regex sweep over the answer text catches the obvious cases
 *      (cheap, deterministic, used to short-circuit the LLM).
 *   2. If the regex sweep is ambiguous OR the answer is long, fall back to
 *      a small LLM call for verification.
 *
 * This module exports the regex stage. The LLM verification happens server-
 * side in src/app/api/follow-up/route.ts.
 */

import type { UncertaintyCheck } from "@/types";

interface SignalPattern {
  name: "risk" | "falsifier" | "guardrail";
  patterns: RegExp[];
}

const SIGNAL_PATTERNS: SignalPattern[] = [
  {
    name: "risk",
    patterns: [
      /the risk\s+(?:I'm|i am|i'd be|i would be|here is|would be)/i,
      /\baccepting\s+(?:is|that|the)\b/i,
      /\bthe (?:big )?risk\s+(?:here|is|of this)\b/i,
      /\b(?:downside|tradeoff|tail risk|asymmetry)\b.{0,40}\b(?:is|here|i'd accept|i would accept)/i,
      /\bthe failure mode\s+is\b/i,
      /\bwhat could go wrong\s+is\b/i,
    ],
  },
  {
    name: "falsifier",
    patterns: [
      /\b(?:would|will|that would)\s+(?:tell|prove|show|signal)\s+(?:me|us)\s+(?:i'm|i am|we're|we are|i'd be|we'd be)\s+wrong\b/i,
      /\bsignal\s+that\s+would\s+tell\s+me\s+i'?m\s+wrong\b/i,
      /\bfalsifier\b/i,
      /\bkill[- ]criteri[a|on]\b/i,
      /\bI'?d\s+know\s+I'?m\s+wrong\s+if\b/i,
      /\bif\s+\w+\s+(?:dropped|fell|declined|stalled|rose|spiked)\b.{0,40}\bI'?d\s+(?:reconsider|stop|pause|change)/i,
      /\bI'?d\s+change\s+my\s+mind\s+if\b/i,
      /\bwhat\s+would\s+change\s+my\s+(?:mind|view)\s+is\b/i,
    ],
  },
  {
    name: "guardrail",
    patterns: [
      /\bguardrail\b/i,
      /\bI'?d\s+monitor\b/i,
      /\bthe metric\s+I'?d\s+(?:watch|monitor|track)\s+(?:is|here)\b/i,
      /\bthe early\s+warning\s+(?:metric|signal|indicator)\b/i,
      /\bcanary\s+(?:metric|signal|rollout)\b/i,
      /\b(?:alarm|alert|threshold)\s+(?:on|at)\b/i,
      /\bI'?d\s+set\s+(?:an?\s+)?(?:alert|alarm|threshold)\b/i,
    ],
  },
];

export function detectUncertaintySignals(answer: string): UncertaintyCheck {
  const lower = answer.toLowerCase();

  const matchedSignal = (name: SignalPattern["name"]) => {
    const sig = SIGNAL_PATTERNS.find((s) => s.name === name)!;
    for (const pat of sig.patterns) {
      const m = lower.match(pat);
      if (m && m[0]) return m[0];
    }
    return undefined;
  };

  const detectedRisk = matchedSignal("risk");
  const detectedFalsifier = matchedSignal("falsifier");
  const detectedGuardrail = matchedSignal("guardrail");

  const hasRisk = Boolean(detectedRisk);
  const hasFalsifier = Boolean(detectedFalsifier);
  const hasGuardrail = Boolean(detectedGuardrail);

  const presentCount = [hasRisk, hasFalsifier, hasGuardrail].filter(Boolean).length;
  let summary = "";
  if (presentCount === 3) {
    summary = "Strong: the answer names risk, falsifier, and guardrail explicitly.";
  } else if (presentCount === 2) {
    const missing = [
      hasRisk ? null : "risk",
      hasFalsifier ? null : "falsifier",
      hasGuardrail ? null : "guardrail",
    ].filter(Boolean);
    summary = `Partial: missing ${missing.join(", ")}. Two of three signals are present.`;
  } else if (presentCount === 1) {
    const present = [
      hasRisk ? "risk" : null,
      hasFalsifier ? "falsifier" : null,
      hasGuardrail ? "guardrail" : null,
    ].filter(Boolean);
    summary = `Weak: only ${present.join(", ")} is named. The frontier-AI bar is to name all three.`;
  } else {
    summary =
      "Missing: the answer does not name risk, falsifier, or guardrail. This is the gap a frontier-AI follow-up will push on.";
  }

  return {
    hasRisk,
    hasFalsifier,
    hasGuardrail,
    detectedRisk,
    detectedFalsifier,
    detectedGuardrail,
    summary,
  };
}

/**
 * Decide whether the candidate's answer needs an adversarial follow-up.
 * The rule: any missing signal triggers a push, up to 3 total pushes.
 */
export function shouldPushFollowUp(
  check: UncertaintyCheck,
  priorPushes: number,
): { push: boolean; missing: ("risk" | "falsifier" | "guardrail")[] } {
  if (priorPushes >= 3) return { push: false, missing: [] };
  const missing: ("risk" | "falsifier" | "guardrail")[] = [];
  if (!check.hasRisk) missing.push("risk");
  if (!check.hasFalsifier) missing.push("falsifier");
  if (!check.hasGuardrail) missing.push("guardrail");
  return { push: missing.length > 0, missing };
}
