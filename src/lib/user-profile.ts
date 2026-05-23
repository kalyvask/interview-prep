/**
 * User profile + anchor stories — types and helpers.
 *
 * Data lives in src/content/personal.ts (gitignored). The committed seed
 * is src/content/personal.example.ts. The predev/prebuild hook
 * (scripts/init-personal.mjs) copies the example to personal.ts the first
 * time the dev server or build runs.
 *
 * To customize: edit src/content/personal.ts directly. Your changes won't
 * be tracked by git.
 */

export interface UserProfile {
  /** Display name. Set to null for anonymous / public-mode. */
  name: string | null;
  education: string[];
  experience: string[];
  skills: string[];
  targetRoles: string[];
  industries: string[];
  yearsExperience: number | null;
  seniorityLevel: string;
  /**
   * Optional plain-text CV. When set, the /interview setup form
   * auto-fills the CV field with this value (the candidate can still
   * edit). Leave undefined or empty to require manual entry.
   */
  cvText?: string;
}

/**
 * Anchor story. Each represents one of the candidate's reusable
 * narratives, shaped after the prep-doc format ("best for", thesis,
 * body, metrics, follow-ups, control-the-risk).
 */
export interface AnchorStory {
  /** Stable key, used to track drift across rounds (see consistency.ts). */
  key: string;
  /** Short label (e.g., "Snowflake Data Clean Room Time-to-Value"). */
  title: string;
  /** What this story is good for. */
  bestFor: string[];
  /** One-line thesis. */
  thesis: string;
  /** The story body, narrative form. */
  body: string;
  /** Metrics / proof points. */
  metrics: string;
  /** Likely follow-up questions. */
  followUps: string[];
  /** Optional: things to be careful NOT to overclaim. */
  controlTheRisk?: string;
}

/**
 * Story-drift detector config. Each key has trigger patterns (regex that
 * indicate the story is being told) and fact patterns (regex with a
 * capture group that pulls a numeric fact). The drift checker compares
 * extracted facts across rounds and flags contradictions.
 */
export interface StoryKeyConfig {
  /** Regex patterns that indicate the candidate is telling this story. */
  triggers: RegExp[];
  /** Named regex patterns; capture group 1 is the extracted fact. */
  factPatterns: Record<string, RegExp>;
}

import {
  PERSONAL_PROFILE as _PERSONAL_PROFILE,
  ANCHOR_STORIES as _ANCHOR_STORIES,
  STORY_KEYS as _STORY_KEYS,
} from "@/content/personal";

export const PERSONAL_PROFILE: UserProfile = _PERSONAL_PROFILE;
export const ANCHOR_STORIES: AnchorStory[] = _ANCHOR_STORIES;
export const STORY_KEYS: Record<string, StoryKeyConfig> = _STORY_KEYS;

export function buildProfileContext(): string {
  const p = PERSONAL_PROFILE;
  const hasAny = p.name || p.experience.length > 0 || p.education.length > 0;
  if (!hasAny) {
    return `CANDIDATE PROFILE: (not configured — generate generic AI PM questions for a senior-level candidate)`;
  }
  const lines = ["CANDIDATE PROFILE:"];
  if (p.name) lines.push(`- Name: ${p.name}`);
  if (p.education.length) lines.push(`- Education: ${p.education.join("; ")}`);
  if (p.experience.length) lines.push(`- Career: ${p.experience.join("; ")}`);
  if (p.skills.length) lines.push(`- Technical skills: ${p.skills.join(", ")}`);
  if (p.targetRoles.length) lines.push(`- Target roles: ${p.targetRoles.join(", ")}`);
  if (p.industries.length) lines.push(`- Industries: ${p.industries.join(", ")}`);
  if (p.yearsExperience !== null) {
    lines.push(
      `- Experience level: ${p.yearsExperience} years, ${p.seniorityLevel}`,
    );
  }
  return lines.join("\n");
}

/**
 * Keep the legacy USER_PROFILE export so any consumer that imported the
 * old name still works. Prefer PERSONAL_PROFILE going forward.
 */
export const USER_PROFILE = PERSONAL_PROFILE;
