/**
 * Interview-loop round definitions, prompts, and rubrics.
 *
 * The 7 rounds mirror the structure in the Codex Deployed PM prep doc
 * (section 4). Each round has:
 *   - a label + short description (UI)
 *   - a question style prompt (used by /api/generate-round-questions)
 *   - a rubric prompt (used by /api/evaluate-answer when a round is set)
 *   - a default question count
 *   - a "what good looks like" example used in feedback
 */

import type { Round } from "@/types";

export interface RoundDef {
  value: Round;
  label: string;
  short: string;
  description: string;
  questionStyle: string;
  rubric: { dimension: string; description: string; max: number }[];
  defaultCount: number;
  targetWindowSec: number; // expected answer length in seconds (for voice mode)
}

export const ROUNDS: RoundDef[] = [
  {
    value: "recruiter",
    label: "Recruiter screen",
    short: "Motivation, fit, resume walk",
    description:
      "30-min screen testing motivation, role fit, and a crisp 90-second self-intro. Often the first round; not technical.",
    questionStyle:
      "Recruiter-screen questions are short and motivation-focused. Test: 90-second intro, Why this company, Why this role, biggest accomplishment, biggest gap for the role, comp/logistics readiness. Each question should be answerable in 60-120 seconds.",
    rubric: [
      { dimension: "Concision", description: "Hits the 90-sec / 2-min landing without rambling", max: 3 },
      { dimension: "Motivation specificity", description: "Why this company / role / team, not generic frontier-AI language", max: 3 },
      { dimension: "Fit signals", description: "Names 2-3 concrete fit signals tied to the role's stated needs", max: 3 },
      { dimension: "Resume coherence", description: "Walks the resume forward with one through-line, not a list", max: 3 },
      { dimension: "Self-awareness", description: "Names the biggest gap honestly with a mitigation", max: 3 },
    ],
    defaultCount: 5,
    targetWindowSec: 90,
  },
  {
    value: "hiring_manager",
    label: "Hiring manager",
    short: "Past launches, hardest failure, customer judgment",
    description:
      "45-60 min round with the role's manager. Tests scope of ownership, metric impact, hardest failure, and how the candidate handled stakeholder conflict.",
    questionStyle:
      "Hiring-manager questions probe a specific past launch end-to-end. Test: walk me through the launch, what was the hardest tradeoff, what failed and what changed, how did you decide what to ship vs cut, how did engineering push back. Each question should pull on the candidate's strongest 2-3 anchor stories.",
    rubric: [
      { dimension: "Scope and ownership", description: "Names what THEY owned vs what the team owned; metric-grounded", max: 3 },
      { dimension: "Tradeoff naming", description: "Names what was given up, not just what was chosen", max: 3 },
      { dimension: "Failure candor", description: "Specific failure + the durable change in operating style", max: 3 },
      { dimension: "Customer-side framing", description: "Names users, buyers, operators, and their incentives by name", max: 3 },
      { dimension: "Learning speed", description: "Shows the loop from evidence to action to result", max: 3 },
    ],
    defaultCount: 5,
    targetWindowSec: 150,
  },
  {
    value: "product_sense",
    label: "Product sense",
    short: "Ambiguous AI / dev product prompt",
    description:
      "45-60 min round on an ambiguous AI / developer / enterprise product prompt. Tests whether the candidate diagnoses before solving, picks a segment, defines a falsifier, and validates the riskiest assumption first.",
    questionStyle:
      "Product-sense prompts are ambiguous and AI-flavored. Examples: 'how would you improve Codex onboarding for a 5,000-engineer enterprise', 'a bank says devs love the product but security blocks expansion - what do you do', 'design a code-review agent for a regulated industry'. Each question should require segment + wedge + falsifier + risk-first validation.",
    rubric: [
      { dimension: "Diagnose before solve", description: "Restates problem with specific user, job, blocker, cost before proposing", max: 3 },
      { dimension: "Segment + wedge", description: "Picks a narrow segment and a specific workflow wedge", max: 3 },
      { dimension: "AI product shape", description: "Names chatbot vs inside-flow vs background vs rules; defends the choice", max: 3 },
      { dimension: "Falsifier", description: "Defines the metric that would tell us the strategy is wrong", max: 3 },
      { dimension: "Risk-first validation", description: "Picks the smallest test that proves the riskiest assumption first", max: 3 },
    ],
    defaultCount: 4,
    targetWindowSec: 240,
  },
  {
    value: "execution_metrics",
    label: "Execution + metrics",
    short: "Diagnosis from divergent metrics",
    description:
      "45-min round on metric diagnosis. Tests whether the candidate can move from a metric symptom to a diagnostic tree, segmentation, and falsifiable experiments.",
    questionStyle:
      "Execution + metrics prompts present a metric symptom. Examples: 'task success is high but repeat usage is flat - diagnose it', 'activation is up 20% but week-2 retention dropped - what's happening', 'we shipped a feature and the leading indicators look great but the lagging metric is flat'. Each question should require diagnostic tree + segmentation + experiment design with success criteria.",
    rubric: [
      { dimension: "Hypothesis quality", description: "Names 3-5 specific hypotheses that map to a funnel, not just guesses", max: 3 },
      { dimension: "Segmentation discipline", description: "Segments by persona, team, repo, interface, task type, tenure", max: 3 },
      { dimension: "Instrumentation", description: "Names the specific metrics that would test each hypothesis", max: 3 },
      { dimension: "Experiment design", description: "Names experiments with success criteria, not vague 'we'd A/B test'", max: 3 },
      { dimension: "Vanity-metric avoidance", description: "Distinguishes leading vs lagging vs vanity; names what would falsify the win", max: 3 },
    ],
    defaultCount: 4,
    targetWindowSec: 240,
  },
  {
    value: "technical_dasme",
    label: "Technical / DASME",
    short: "AI system design with model selection",
    description:
      "60-min AI system design round. Uses DASME: Define, Architect, Specify (data + models), Map metrics, Edge cases + scale. Tests model selection (LLM vs ML vs rules) and model-layer vs application-layer judgment.",
    questionStyle:
      "Technical / DASME prompts are open AI system design. Examples: 'design an eval system for an AI coding assistant', 'design a safe MCP integration system for a regulated enterprise', 'design a RAG system for a 10M-line monorepo', 'when would you use a larger LLM vs a smaller one vs rules'. Each question should require named agents with non-overlapping roles, explicit model selection, hybrid det+LLM discipline, and 10x scale bottleneck reasoning.",
    rubric: [
      { dimension: "Define + clarify", description: "Names scope, user, objective, constraints, single vs multi-agent", max: 3 },
      { dimension: "Architecture", description: "4 layers (interaction, orchestration, agent, data) with non-overlapping agents", max: 3 },
      { dimension: "Model selection", description: "Tags every component as LLM, ML, retrieval, rules, or no model with WHY", max: 3 },
      { dimension: "Metrics cascade", description: "Model -> UX -> business cascade with guardrails", max: 3 },
      { dimension: "Failure modes + scale", description: "Names prompt injection, secrets, p99 latency, 10x scale bottleneck", max: 3 },
    ],
    defaultCount: 3,
    targetWindowSec: 360,
  },
  {
    value: "stakeholder_gtm",
    label: "Stakeholder / GTM",
    short: "Customer scenario, CTO present, expansion",
    description:
      "45-60 min round on a customer-deployment scenario. Tests enterprise deployment playbook: discovery, workflow wedge, pilot, governance, metrics, expansion.",
    questionStyle:
      "Stakeholder / GTM prompts are customer-scenario shaped. Examples: 'present to the CTO of a bank that blocked expansion', 'expansion from 50 to 5,000 developers in one account', 'a customer feedback pattern shows up 5 times in a quarter - how do you make it product roadmap input'. Each question should require: stakeholder map by archetype, workflow wedge, pilot plan, governance + metrics, expansion gate.",
    rubric: [
      { dimension: "Stakeholder reading", description: "Names buyers, champions, operators, blockers, silent skeptics with incentives", max: 3 },
      { dimension: "Wedge selection", description: "Specific narrow workflow with explicit out-of-scope", max: 3 },
      { dimension: "Pilot gates", description: "Defines success, failure, and kill criteria upfront with named owners", max: 3 },
      { dimension: "Governance fit", description: "Names admin, security, audit, compliance surfaces as v1 not v2", max: 3 },
      { dimension: "Expansion path", description: "Defines how value, trust, and governance compound into expansion", max: 3 },
    ],
    defaultCount: 4,
    targetWindowSec: 240,
  },
  {
    value: "behavioral_values",
    label: "Behavioral / values",
    short: "Ambiguity, conflict, feedback, safety",
    description:
      "45-min behavioral round on ambiguity, conflict, feedback openness, and mission alignment. For frontier-AI loops, safety must change a real decision in at least one story.",
    questionStyle:
      "Behavioral / values prompts probe how the candidate operated. Examples: 'tell me about a time you worked in ambiguity', 'tell me about a conflict with engineering', 'tell me about feedback you received', 'tell me about a time safety changed a decision', 'tell me about a time you disagreed with leadership'. Each question expects STAR+M with explicit reflection on the operating-style change.",
    rubric: [
      { dimension: "STAR completeness", description: "Situation, Task, Action, Result, all present and specific", max: 3 },
      { dimension: "Action specificity", description: "Names what THEY did, not what the team did; first-person verbs", max: 3 },
      { dimension: "Metrics", description: "Quantified outcome tied to business or user impact", max: 3 },
      { dimension: "Self-awareness", description: "Names the mistake, the reframe, and the durable behavior change", max: 3 },
      { dimension: "Safety / mission alignment", description: "Where relevant, safety or mission alignment changes a real decision", max: 3 },
    ],
    defaultCount: 5,
    targetWindowSec: 150,
  },
];

export function getRound(round: Round): RoundDef {
  const def = ROUNDS.find((r) => r.value === round);
  if (!def) throw new Error(`Unknown round: ${round}`);
  return def;
}

export const DEFAULT_LOOP_SEQUENCE: Round[] = [
  "recruiter",
  "hiring_manager",
  "product_sense",
  "execution_metrics",
  "technical_dasme",
  "stakeholder_gtm",
  "behavioral_values",
];
