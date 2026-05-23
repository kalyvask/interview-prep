/**
 * Loop-mode consistency tracking.
 *
 * Real interview loops surface story drift: the candidate says "8 countries"
 * in the HM round and "5 countries" in the stakeholder round. The grader
 * never asks; they just downgrade. This module catches drift by extracting
 * facts from each answer and flagging contradictions across rounds.
 *
 * Detection is heuristic (regex + lightweight LLM extraction). The current
 * implementation focuses on numeric facts and named entities; expand the
 * extractors as more story keys emerge.
 */

import type { ConsistencyReport, StoryDriftEntry, StoryMention } from "@/types";
import { STORY_KEYS } from "@/lib/user-profile";

// STORY_KEYS lives in src/content/personal.ts so each user defines their
// own anchor stories + fact patterns. The drift checker is generic: given
// a story key with trigger regex and named fact regex, it pulls a fact
// from each round's answer and flags inter-round contradictions.
export { STORY_KEYS };

export function extractMentions(
  round: import("@/types").Round,
  questionId: string,
  answer: string,
): StoryMention[] {
  const mentions: StoryMention[] = [];
  for (const [storyKey, def] of Object.entries(STORY_KEYS)) {
    const triggered = def.triggers.some((t) => t.test(answer));
    if (!triggered) continue;

    const facts: Record<string, string> = {};
    for (const [factName, pattern] of Object.entries(def.factPatterns)) {
      const m = answer.match(pattern);
      if (m && m[1]) facts[factName] = m[1];
    }
    if (Object.keys(facts).length === 0) continue;

    // Take the surrounding sentence as the excerpt
    const firstTrigger = def.triggers.find((t) => t.test(answer))!;
    const triggerMatch = answer.match(firstTrigger);
    const idx = triggerMatch ? answer.indexOf(triggerMatch[0]) : 0;
    const start = Math.max(0, idx - 60);
    const end = Math.min(answer.length, idx + 200);
    const excerpt = answer.slice(start, end).trim();

    mentions.push({ round, questionId, storyKey, facts, excerpt });
  }
  return mentions;
}

export function buildConsistencyReport(mentions: StoryMention[]): ConsistencyReport {
  // Group by storyKey + factName, detect distinct values
  const factTable: Record<string, Record<string, { round: import("@/types").Round; value: string; questionId: string }[]>> =
    {};
  for (const m of mentions) {
    factTable[m.storyKey] ||= {};
    for (const [fact, value] of Object.entries(m.facts)) {
      factTable[m.storyKey][fact] ||= [];
      factTable[m.storyKey][fact].push({ round: m.round, value, questionId: m.questionId });
    }
  }

  const drifts: StoryDriftEntry[] = [];
  for (const [storyKey, facts] of Object.entries(factTable)) {
    for (const [fact, occurrences] of Object.entries(facts)) {
      const distinctValues = new Set(occurrences.map((o) => o.value));
      if (distinctValues.size > 1) {
        drifts.push({ storyKey, fact, values: occurrences });
      }
    }
  }

  // Consistency score: 100 baseline, subtract 20 per drift (capped 0)
  const consistencyScore = Math.max(0, 100 - drifts.length * 20);

  let summary: string;
  if (drifts.length === 0) {
    summary = `No story drift detected across ${mentions.length} story mentions. Consistent across rounds.`;
  } else if (drifts.length === 1) {
    const d = drifts[0];
    summary = `1 drift detected on story \`${d.storyKey}\`, fact \`${d.fact}\`. Pick the canonical value and use it in every round.`;
  } else {
    summary = `${drifts.length} drifts detected across stories. Interviewers compare answers across rounds; pick canonical values and rehearse them.`;
  }

  return { drifts, consistencyScore, summary };
}
