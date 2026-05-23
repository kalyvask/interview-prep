/**
 * Voice-answer scoring helpers.
 *
 * Lightweight, deterministic measures over a transcript:
 *   - words per minute
 *   - filler-word count
 *   - target-window judgement (e.g., the 90-second self-intro)
 *
 * Transcription itself happens server-side in /api/transcribe (OpenAI
 * Whisper). This module only post-processes the transcript.
 */

import type { VoiceCapture } from "@/types";

// Common spoken fillers. Add domain-specific ones as needed.
const FILLER_PATTERNS: RegExp[] = [
  /\b(?:um|uh|er|erm|hmm)\b/gi,
  /\b(?:like)\b/gi,
  /\b(?:you know)\b/gi,
  /\b(?:i mean)\b/gi,
  /\b(?:sort of)\b/gi,
  /\b(?:kind of)\b/gi,
  /\b(?:basically)\b/gi,
  /\b(?:literally)\b/gi,
  /\b(?:actually)\b/gi,
  /\b(?:right\?)/gi,
];

export interface VoiceScoreInput {
  transcript: string;
  durationMs: number;
  targetWindowSec: number; // 90 for recruiter intro, 240 for product sense, etc.
}

export function scoreVoice(input: VoiceScoreInput): VoiceCapture {
  const { transcript, durationMs, targetWindowSec } = input;
  const durationSec = Math.max(1, durationMs / 1000);
  const words = transcript
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);
  const wordCount = words.length;
  const wordsPerMinute = Math.round((wordCount / durationSec) * 60);

  const fillers: string[] = [];
  for (const pattern of FILLER_PATTERNS) {
    const matches = transcript.match(pattern);
    if (matches) fillers.push(...matches.map((m) => m.toLowerCase().trim()));
  }
  const fillerCount = fillers.length;

  // Target window: an answer is "in window" if it lands within +/- 25% of the
  // target. Recruiter 90-sec answer is fine at 70-110 seconds.
  const lowerBound = targetWindowSec * 0.75;
  const upperBound = targetWindowSec * 1.25;
  const inTargetWindow = durationSec >= lowerBound && durationSec <= upperBound;

  const pacingFeedback = buildPacingFeedback({
    durationSec,
    targetWindowSec,
    wordsPerMinute,
    fillerCount,
    inTargetWindow,
  });

  return {
    durationMs,
    wordsPerMinute,
    fillerCount,
    fillerWords: fillers,
    targetWindowSec,
    inTargetWindow,
    pacingFeedback,
  };
}

function buildPacingFeedback(args: {
  durationSec: number;
  targetWindowSec: number;
  wordsPerMinute: number;
  fillerCount: number;
  inTargetWindow: boolean;
}): string {
  const parts: string[] = [];
  if (args.inTargetWindow) {
    parts.push(
      `Landed at ${Math.round(args.durationSec)}s against a ${args.targetWindowSec}s target.`,
    );
  } else if (args.durationSec < args.targetWindowSec * 0.75) {
    parts.push(
      `Too short: ${Math.round(args.durationSec)}s vs ${args.targetWindowSec}s target. The answer probably skipped a story chunk; aim closer to the target.`,
    );
  } else {
    parts.push(
      `Too long: ${Math.round(args.durationSec)}s vs ${args.targetWindowSec}s target. The interviewer would interrupt; cut one chunk.`,
    );
  }

  if (args.wordsPerMinute < 110) {
    parts.push(`Pace is slow (${args.wordsPerMinute} wpm). Pick up tempo; sounds tentative.`);
  } else if (args.wordsPerMinute > 180) {
    parts.push(`Pace is fast (${args.wordsPerMinute} wpm). Slow down; reduces credibility.`);
  } else {
    parts.push(`Pace is in range (${args.wordsPerMinute} wpm).`);
  }

  if (args.fillerCount === 0) {
    parts.push("No fillers detected.");
  } else {
    const perMinute = (args.fillerCount / (args.durationSec / 60)).toFixed(1);
    if (Number(perMinute) > 4) {
      parts.push(`Fillers high: ${args.fillerCount} in the answer (${perMinute}/min). Aim for <4/min.`);
    } else {
      parts.push(`Fillers: ${args.fillerCount} (${perMinute}/min) — within range.`);
    }
  }

  return parts.join(" ");
}
