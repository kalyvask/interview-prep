/**
 * Personal config layer — example / seed file.
 *
 * On first dev/build, scripts/init-personal.mjs copies this file to
 * src/content/personal.ts (gitignored). Edit personal.ts with your own
 * profile, anchor stories, and drift-detection keys. The mock interview
 * routes (/api/start-interview, /api/grade, /api/summary) and the
 * round-mode consistency checker read from personal.ts via
 * @/lib/user-profile.
 *
 * This file ships with public placeholder data. Replace it locally in
 * personal.ts (not here) so your real CV, stories, and metrics stay off
 * the repo.
 */

import type {
  UserProfile,
  AnchorStory,
  StoryKeyConfig,
} from "@/lib/user-profile";

export const PERSONAL_PROFILE: UserProfile = {
  name: null, // set to your name, or leave null for anonymous
  education: [
    // "[Your degree, school, year]",
  ],
  experience: [
    // "[Role at Company — what you owned, the headline metric, the team size]",
    // "[Earlier role at Company — same shape]",
  ],
  skills: [
    // "SQL", "Python", "ML / Applied AI", "Multi-agent systems", ...
  ],
  targetRoles: [
    "AI Product Manager",
    "Senior AI PM at frontier AI labs",
  ],
  industries: [
    "Frontier AI",
    "Enterprise AI",
  ],
  yearsExperience: null, // e.g., 8
  seniorityLevel: "Senior",
  // Paste your CV as plain text here to auto-fill the /interview setup form.
  // Leave undefined or empty to require manual upload each session.
  // cvText: `…paste CV text here…`,
};

/**
 * Anchor stories. Each represents one of your reusable narratives, shaped
 * after the prep-doc format (thesis, body, metrics, follow-ups,
 * control-the-risk). The grader pulls these in for the round-mode
 * consistency checker. Add 5-10 of your strongest.
 */
export const ANCHOR_STORIES: AnchorStory[] = [
  // {
  //   key: "your_story_key",
  //   title: "Short, memorable label",
  //   bestFor: ["behavioral round", "AI PM", "stakeholder conflict"],
  //   thesis: "One-line claim this story proves about you.",
  //   body: "Full narrative — situation, your specific actions, what shipped.",
  //   metrics: "Headline numbers. Be precise; don't inflate.",
  //   followUps: [
  //     "What an interviewer typically pushes on next.",
  //     "Another likely follow-up.",
  //   ],
  //   controlTheRisk: "Things to NOT overclaim. Leave undefined if not needed.",
  // },
];

/**
 * Story-drift detector config. Each key has trigger regex (that indicate
 * the story is being told) and fact patterns (regex with a capture group
 * that pulls a numeric fact). The drift checker compares extracted facts
 * across rounds and flags contradictions.
 *
 * Example shape (commented out — replace with your real stories):
 *
 *   your_story_key: {
 *     triggers: [/keyword.{0,20}phrase/i, /your\s+metric\b/i],
 *     factPatterns: {
 *       savings: /\$\s?(\d{1,3})\s?(?:m|million)/i,
 *       countries: /(\d{1,2})\s+countries/i,
 *     },
 *   },
 */
export const STORY_KEYS: Record<string, StoryKeyConfig> = {};
