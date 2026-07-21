import type { Round } from "@/types";
import { EXTRA_QUESTIONS } from "./personal";
import type {
  QuestionCategory,
  Stage,
  Question,
  ExtraQuestion,
} from "./question-types";

// Re-export shared types so existing consumers keep working unchanged.
export type { QuestionCategory, Stage, Question, ExtraQuestion };

export type CategoryNote = {
  category: QuestionCategory;
  passLine: string;
};

export type StageNote = {
  stage: Stage;
  label: string;
  short: string;
  passLine: string;
};

export const STAGE_ORDER: Stage[] = [
  "recruiter",
  "hiring_manager",
  "product_sense",
  "execution_metrics",
  "technical_dasme",
  "stakeholder_gtm",
  "behavioral_values",
];

export const STAGE_LABELS: Record<Stage, string> = {
  recruiter: "Recruiter screen",
  hiring_manager: "Hiring manager",
  product_sense: "Product sense",
  execution_metrics: "Execution + metrics",
  technical_dasme: "Technical / DASME",
  stakeholder_gtm: "Stakeholder / GTM",
  behavioral_values: "Behavioral / values",
};

export const STAGE_NOTES: StageNote[] = [
  {
    stage: "recruiter",
    label: "Recruiter screen",
    short: "Motivation, fit, 90-sec intro",
    passLine:
      "Keep each answer to 60-120 seconds. Land the 90-second intro without rambling. Name 2-3 concrete fit signals tied to the role. Flip the biggest gap into a mitigation, not a confession.",
  },
  {
    stage: "hiring_manager",
    label: "Hiring manager",
    short: "Past launches, hardest tradeoffs, customer judgment",
    passLine:
      "Pull on your 2-3 strongest anchor stories. Name what YOU owned vs the team. Name what was given up, not just what was chosen. Failure stories should end in a durable change in operating style, not a moral lesson.",
  },
  {
    stage: "product_sense",
    label: "Product sense",
    short: "Ambiguous AI / dev / enterprise product prompt",
    passLine:
      "Diagnose before solving. Pick a narrow segment and a specific workflow wedge. Name the AI product shape (chatbot / inside-flow / background / rules / hybrid) and defend it. Define the falsifier — the metric that would tell you the strategy is wrong. Validate the riskiest assumption first.",
  },
  {
    stage: "execution_metrics",
    label: "Execution + metrics",
    short: "Diagnosis from divergent metrics",
    passLine:
      "From symptom to hypotheses to segmentation to experiment. Name 3-5 hypotheses that map to a funnel, not just guesses. Segment by persona / team / interface / task type / tenure. Name the experiments with success criteria, not vague 'we'd A/B test'. Distinguish leading vs lagging vs vanity.",
  },
  {
    stage: "technical_dasme",
    label: "Technical / DASME",
    short: "AI system design with model selection",
    passLine:
      "DASME phases with the right time allocation. 4-layer diagram with non-overlapping agents. Tag every component as LLM / ML / retrieval / rules / no-model with the WHY. Metrics cascade (model → UX → business) with guardrails. Name prompt-injection, secrets, p99 latency, and the 10x scale bottleneck with a concrete fix.",
  },
  {
    stage: "stakeholder_gtm",
    label: "Stakeholder / GTM",
    short: "Customer scenarios, expansion, deployment",
    passLine:
      "Read the stakeholder map by archetype (buyer, champion, operator, blocker, silent skeptic) and tie each to incentives. Pick a specific narrow wedge with explicit out-of-scope. Define success, failure, and kill criteria upfront with named owners. Treat admin / security / audit / compliance as v1, not v2. Define how value, trust, and governance compound into expansion.",
  },
  {
    stage: "behavioral_values",
    label: "Behavioral / values",
    short: "Ambiguity, conflict, feedback, safety",
    passLine:
      "STAR+M: Situation, Task, Action, Result, Metrics — all present and specific. First-person verbs (what YOU did, not what the team did). Quantified outcome. Name the mistake, the reframe, the durable behavior change. Where relevant, safety or mission alignment must change a real decision.",
  },
];

export const CATEGORY_NOTES: CategoryNote[] = [
  {
    category: "Customer-Facing AI Agents",
    passLine:
      "Get to the diagram within 40% of your answer. Pick a concrete domain (telecom, fintech, healthcare). Three agents with non-overlapping roles — Analyst (prediction), Conversation (LLM), Executor (rules + recommender).",
  },
  {
    category: "Content + Recommendations",
    passLine:
      "Pipeline with 3 stages, each a different model. Candidate generation (collaborative filtering, embedding similarity). Ranking (learning-to-rank on engagement). Re-ranking (rules — freshness, safety, diversity). Name all three memory types.",
  },
  {
    category: "Search + Retrieval",
    passLine:
      "Hybrid BM25 + dense retrieval, plus a lightweight classifier that routes between them. Pure vector fails on exact match (\"order #12345\"). Pure keyword fails on intent (\"comfortable shoes for standing all day\"). Mention multilingual, code search, contradictory results.",
  },
  {
    category: "Evaluation + Safety",
    passLine:
      "Safety wired into the pipeline, not bolted on. Every output passes a safety check before reaching the user. Two feedback loops — real-time blocking and batch auditing. Connect to company-specific safety frameworks (Constitutional AI, Googleyness, deployment safety).",
  },
  {
    category: "Autonomous Agents + Workflows",
    passLine:
      "Never a single omniscient agent. Multi-agent with explicit handoff protocols. Each agent: one job, one model, one failure mode. Orchestrator manages sequence, state, retries. Answer scaling with a named bottleneck and a concrete fix.",
  },
  {
    category: "Prediction + Analytics",
    passLine:
      "If you reach for an LLM on a tabular prediction task, you've failed. XGBoost, random forest, time series — cheaper, faster, more interpretable, ~100x less cost per prediction. Run the metric cascade with dollar math.",
  },
  {
    category: "AI Literacy",
    passLine:
      "Crisp definition first, then the PM 'so what' — the product decision the concept drives. One-minute exec explanation, then the tradeoff. Name the failure mode. Never hand-wave 'AI magic': say which layer (retrieval, generation, orchestration, guardrail) and why.",
  },
  {
    category: "Cost + Unit Economics",
    passLine:
      "Do the dollar math out loud: tokens in/out × price, cache hit rate, calls per task. Separate p50 from p99 latency, and time-to-first-token from total. Tie every lever back to gross margin at scale.",
  },
  {
    category: "AI Strategy",
    passLine:
      "Assume the base model is a commodity every competitor can call. The moat lives in the data flywheel, workflow depth, distribution, and switching cost — not the weights. Name the platform risk and the narrow wedge.",
  },
  {
    category: "Product Sense Cases",
    passLine:
      "Not a system-design round — but the model-layer / app-layer distinction still earns points. Mention safety. Use real numbers. Pick a segment.",
  },
  {
    category: "Recruiter screen",
    passLine:
      "Short answers (60-120s). Specific motivation, not 'I love AI.' Concrete fit signals. Honest mitigation of the biggest gap.",
  },
  {
    category: "Hiring manager",
    passLine:
      "Anchor stories with metrics, named tradeoffs, and durable operating-style changes. The hardest tradeoff, the failure, the customer call that changed your mind.",
  },
  {
    category: "Execution + metrics",
    passLine:
      "Diagnostic tree → segmentation → experiment with kill criteria. Distinguish leading vs lagging vs vanity. Name the falsifier.",
  },
  {
    category: "Stakeholder / GTM",
    passLine:
      "Stakeholder archetypes with incentives. Narrow wedge with explicit out-of-scope. Governance as v1. Expansion gates with named owners.",
  },
  {
    category: "Behavioral / values",
    passLine:
      "STAR+M with first-person verbs. Specific failure, durable reframe. Safety or mission alignment as a real decision input, where relevant.",
  },
];

/**
 * Public bank — 140 questions visible in any fork. Used in /questions,
 * the picker form, AND in the prompt-time shape examples in
 * session-prompts.ts (so personal extras stay out of model prompts).
 */
export const PUBLIC_QUESTIONS: Question[] = [
  // Customer-Facing AI Agents (1–12) — Technical / DASME
  { number: 1,  text: "Design a churn reduction agent for a telecom company.",                              category: "Customer-Facing AI Agents", stage: "technical_dasme" },
  { number: 2,  text: "Build a customer support agent that handles refund requests end-to-end.",            category: "Customer-Facing AI Agents", stage: "technical_dasme" },
  { number: 3,  text: "Design a wealth-management AI agent for retail banking customers.",                  category: "Customer-Facing AI Agents", stage: "technical_dasme" },
  { number: 4,  text: "Architect a healthcare appointment-scheduling agent.",                               category: "Customer-Facing AI Agents", stage: "technical_dasme" },
  { number: 5,  text: "Design an AI travel concierge that books multi-city itineraries.",                   category: "Customer-Facing AI Agents", stage: "technical_dasme" },
  { number: 6,  text: "Build a restaurant reservation and recommendation agent.",                           category: "Customer-Facing AI Agents", stage: "technical_dasme" },
  { number: 7,  text: "Design an AI real-estate agent that qualifies buyers and schedules showings.",       category: "Customer-Facing AI Agents", stage: "technical_dasme" },
  { number: 8,  text: "Architect a customer-onboarding agent for a SaaS product.",                          category: "Customer-Facing AI Agents", stage: "technical_dasme" },
  { number: 9,  text: "Design a returns-and-exchange agent for an e-commerce retailer.",                    category: "Customer-Facing AI Agents", stage: "technical_dasme" },
  { number: 10, text: "Build a B2B sales assistant agent that drafts proposals.",                           category: "Customer-Facing AI Agents", stage: "technical_dasme" },
  { number: 11, text: "Design a pharmacy prescription-refill agent.",                                       category: "Customer-Facing AI Agents", stage: "technical_dasme" },
  { number: 12, text: "Architect a fitness-coaching AI agent for a consumer app.",                          category: "Customer-Facing AI Agents", stage: "technical_dasme" },

  // Content + Recommendations (13–22) — Technical / DASME
  { number: 13, text: "Design a content recommendation system using LLMs for understanding and ML for ranking.", category: "Content + Recommendations", stage: "technical_dasme" },
  { number: 14, text: "Design AI-generated post summaries at scale for a social feed.",                          category: "Content + Recommendations", stage: "technical_dasme" },
  { number: 15, text: "Design an AI agent that helps creators optimize their Reels / Shorts content.",           category: "Content + Recommendations", stage: "technical_dasme" },
  { number: 16, text: "Architect a personalized newsletter generation system.",                                  category: "Content + Recommendations", stage: "technical_dasme" },
  { number: 17, text: "Design the video recommendation system for a streaming platform.",                        category: "Content + Recommendations", stage: "technical_dasme" },
  { number: 18, text: "Build a music recommendation system blending listening history with contextual signals.", category: "Content + Recommendations", stage: "technical_dasme" },
  { number: 19, text: "Design a podcast discovery and recommendation engine.",                                   category: "Content + Recommendations", stage: "technical_dasme" },
  { number: 20, text: "Architect an AI-curated news feed with bias mitigation.",                                 category: "Content + Recommendations", stage: "technical_dasme" },
  { number: 21, text: "Design a product recommendation system for an e-commerce homepage.",                      category: "Content + Recommendations", stage: "technical_dasme" },
  { number: 22, text: "Build an AI system that generates personalized workout playlists.",                       category: "Content + Recommendations", stage: "technical_dasme" },

  // Search + Retrieval (23–32) — Technical / DASME
  { number: 23, text: "Design an enterprise knowledge base with RAG for a financial-services firm.",     category: "Search + Retrieval", stage: "technical_dasme" },
  { number: 24, text: "Architect a search system combining traditional retrieval with LLM re-ranking.",  category: "Search + Retrieval", stage: "technical_dasme" },
  { number: 25, text: "Design the retrieval system for ChatGPT's memory feature.",                       category: "Search + Retrieval", stage: "technical_dasme" },
  { number: 26, text: "Build a code-search system for a large internal codebase.",                       category: "Search + Retrieval", stage: "technical_dasme" },
  { number: 27, text: "Design a legal-document search and summarization system.",                        category: "Search + Retrieval", stage: "technical_dasme" },
  { number: 28, text: "Architect a medical-literature search system for clinicians.",                    category: "Search + Retrieval", stage: "technical_dasme" },
  { number: 29, text: "Design a multi-modal search system (text + image + video).",                      category: "Search + Retrieval", stage: "technical_dasme" },
  { number: 30, text: "Build a product-catalog search for a large e-commerce platform.",                 category: "Search + Retrieval", stage: "technical_dasme" },
  { number: 31, text: "Design a job-search ranking and matching system.",                                category: "Search + Retrieval", stage: "technical_dasme" },
  { number: 32, text: "Architect a customer-support knowledge search powering both agents and self-service.", category: "Search + Retrieval", stage: "technical_dasme" },

  // Evaluation + Safety (33–42) — Technical / DASME
  { number: 33, text: "Design a content-moderation system for a social platform with 500M daily posts.", category: "Evaluation + Safety", stage: "technical_dasme" },
  { number: 34, text: "Design the evaluation system for Claude's tool-use capabilities.",                category: "Evaluation + Safety", stage: "technical_dasme" },
  { number: 35, text: "How would you architect a jailbreak-detection system?",                           category: "Evaluation + Safety", stage: "technical_dasme" },
  { number: 36, text: "Design a system that identifies and mitigates hallucinations at scale.",          category: "Evaluation + Safety", stage: "technical_dasme" },
  { number: 37, text: "Build an adversarial-prompt detection pipeline for a consumer chatbot.",          category: "Evaluation + Safety", stage: "technical_dasme" },
  { number: 38, text: "Design an eval system for an AI coding assistant.",                               category: "Evaluation + Safety", stage: "technical_dasme" },
  { number: 39, text: "Architect a model red-teaming workflow.",                                         category: "Evaluation + Safety", stage: "technical_dasme" },
  { number: 40, text: "Design a bias-detection and mitigation system for a hiring product.",             category: "Evaluation + Safety", stage: "technical_dasme" },
  { number: 41, text: "Build a safety-evaluation harness for a multi-modal model.",                      category: "Evaluation + Safety", stage: "technical_dasme" },
  { number: 42, text: "Design a human-in-the-loop review system for high-risk AI outputs.",              category: "Evaluation + Safety", stage: "technical_dasme" },

  // Autonomous Agents + Workflows (43–54) — Technical / DASME
  { number: 43, text: "Design an AI agent for enterprise workflow automation.",                                category: "Autonomous Agents + Workflows", stage: "technical_dasme" },
  { number: 44, text: "Build an AI agent for sellers on a marketplace (inventory, pricing, listings).",        category: "Autonomous Agents + Workflows", stage: "technical_dasme" },
  { number: 45, text: "Design automated product-listing optimization using AI.",                               category: "Autonomous Agents + Workflows", stage: "technical_dasme" },
  { number: 46, text: "Architect an AI recruiter that screens and schedules candidates.",                      category: "Autonomous Agents + Workflows", stage: "technical_dasme" },
  { number: 47, text: "Design an AI financial analyst that prepares earnings summaries.",                      category: "Autonomous Agents + Workflows", stage: "technical_dasme" },
  { number: 48, text: "Build an AI marketing-campaign generator and optimizer.",                               category: "Autonomous Agents + Workflows", stage: "technical_dasme" },
  { number: 49, text: "Design an AI code-review agent for a large engineering org.",                           category: "Autonomous Agents + Workflows", stage: "technical_dasme" },
  { number: 50, text: "Architect an AI agent that manages a small business's email and calendar.",             category: "Autonomous Agents + Workflows", stage: "technical_dasme" },
  { number: 51, text: "Design an AI-powered incident-response agent for an ops team.",                         category: "Autonomous Agents + Workflows", stage: "technical_dasme" },
  { number: 52, text: "Build an AI agent that runs structured user-research studies end-to-end.",              category: "Autonomous Agents + Workflows", stage: "technical_dasme" },
  { number: 53, text: "Design a multi-agent debugging system for production services.",                        category: "Autonomous Agents + Workflows", stage: "technical_dasme" },
  { number: 54, text: "Architect an AI agent for proactive Alexa-style suggestions across a smart home.",      category: "Autonomous Agents + Workflows", stage: "technical_dasme" },

  // Prediction + Analytics (55–64) — Technical / DASME
  { number: 55, text: "Design a churn-prediction and intervention system for an API product.",        category: "Prediction + Analytics", stage: "technical_dasme" },
  { number: 56, text: "Architect a fraud-detection system using both ML and LLM components.",         category: "Prediction + Analytics", stage: "technical_dasme" },
  { number: 57, text: "Design a demand-forecasting system for a retail chain.",                       category: "Prediction + Analytics", stage: "technical_dasme" },
  { number: 58, text: "Build a credit-risk scoring system.",                                          category: "Prediction + Analytics", stage: "technical_dasme" },
  { number: 59, text: "Design an LTV prediction model for a subscription business.",                  category: "Prediction + Analytics", stage: "technical_dasme" },
  { number: 60, text: "Architect a dynamic pricing system for a ride-sharing platform.",              category: "Prediction + Analytics", stage: "technical_dasme" },
  { number: 61, text: "Design a customer-segmentation system that drives personalization.",           category: "Prediction + Analytics", stage: "technical_dasme" },
  { number: 62, text: "Build an ad-click prediction system.",                                         category: "Prediction + Analytics", stage: "technical_dasme" },
  { number: 63, text: "Design a delivery-ETA prediction system for a logistics company.",             category: "Prediction + Analytics", stage: "technical_dasme" },
  { number: 64, text: "Architect an AI system for predictive equipment maintenance.",                 category: "Prediction + Analytics", stage: "technical_dasme" },

  // Product Sense Cases (65–72) — Product sense
  { number: 65, text: "How would you improve Claude's onboarding for a new user?",                              category: "Product Sense Cases", stage: "product_sense" },
  { number: 66, text: "Design a new AI feature for Instagram that increases creator retention.",                category: "Product Sense Cases", stage: "product_sense" },
  { number: 67, text: "ChatGPT's weekly active users dropped 5% — what do you investigate?",                    category: "Product Sense Cases", stage: "product_sense" },
  { number: 68, text: "Design an AI feature for Google Docs that saves people 30 minutes per day.",             category: "Product Sense Cases", stage: "product_sense" },
  { number: 69, text: "How would you price Claude API for enterprise customers?",                               category: "Product Sense Cases", stage: "product_sense" },
  { number: 70, text: "Pitch three AI features for Spotify.",                                                   category: "Product Sense Cases", stage: "product_sense" },
  { number: 71, text: "Design an AI feature for a niche vertical (legal, education, healthcare — pick one).",   category: "Product Sense Cases", stage: "product_sense" },
  { number: 72, text: "Your AI feature has 15% weekly engagement but 40% of users say it hallucinates. What do you do?", category: "Product Sense Cases", stage: "product_sense" },

  // Recruiter screen (73–78)
  { number: 73, text: "Walk me through your background in 90 seconds.",                                                                                 category: "Recruiter screen", stage: "recruiter" },
  { number: 74, text: "Why this company — and why now?",                                                                                                category: "Recruiter screen", stage: "recruiter" },
  { number: 75, text: "Why this role specifically — not the manager track, not a strategy seat, not engineering?",                                      category: "Recruiter screen", stage: "recruiter" },
  { number: 76, text: "What is the single biggest gap you would have for this role, and how would you mitigate it in your first 60 days?",            category: "Recruiter screen", stage: "recruiter" },
  { number: 77, text: "What kind of work makes you feel most alive — and where in this role would you find it?",                                       category: "Recruiter screen", stage: "recruiter" },
  { number: 78, text: "Walk me through your resume in two minutes, forward chronology, with one through-line connecting the moves.",                  category: "Recruiter screen", stage: "recruiter" },

  // Hiring manager (79–86)
  { number: 79, text: "Walk me through the most impactful product you have launched end to end.",                                                      category: "Hiring manager", stage: "hiring_manager" },
  { number: 80, text: "Tell me about a launch that did not land the way you predicted. What did you learn that you still use today?",                  category: "Hiring manager", stage: "hiring_manager" },
  { number: 81, text: "What did you give up to ship your last big release — and who was upset about it?",                                              category: "Hiring manager", stage: "hiring_manager" },
  { number: 82, text: "Tell me about a tradeoff where the right answer was not the safe answer.",                                                      category: "Hiring manager", stage: "hiring_manager" },
  { number: 83, text: "Tell me about a time engineering pushed back on you and was right.",                                                            category: "Hiring manager", stage: "hiring_manager" },
  { number: 84, text: "What metric do you wake up worried about, and why that one over the obvious alternatives?",                                     category: "Hiring manager", stage: "hiring_manager" },
  { number: 85, text: "If we gave you a six-month roadmap with no constraints, what is the first thing you would cut?",                                category: "Hiring manager", stage: "hiring_manager" },
  { number: 86, text: "Tell me about a customer call that changed your mind about a product direction.",                                               category: "Hiring manager", stage: "hiring_manager" },

  // Execution + metrics (87–94)
  { number: 87, text: "Activation is up 20% but week-2 retention dropped 8%. What do you investigate first?",                                          category: "Execution + metrics", stage: "execution_metrics" },
  { number: 88, text: "Your AI feature has 85% task success but flat repeat usage. Diagnose it.",                                                      category: "Execution + metrics", stage: "execution_metrics" },
  { number: 89, text: "Leading indicators are green but the lagging metric is flat. What is the first experiment you run?",                            category: "Execution + metrics", stage: "execution_metrics" },
  { number: 90, text: "DAU is flat but session length grew 30%. Is that good or bad?",                                                                 category: "Execution + metrics", stage: "execution_metrics" },
  { number: 91, text: "One country's conversion is 3x the global average. Real signal or instrumentation bug? Walk me through the diagnostic.",        category: "Execution + metrics", stage: "execution_metrics" },
  { number: 92, text: "We shipped a feature targeting power users; engagement spiked on casual users instead. What now?",                              category: "Execution + metrics", stage: "execution_metrics" },
  { number: 93, text: "Your latency is up 15% post-launch but conversion is also up. Roll back or hold?",                                              category: "Execution + metrics", stage: "execution_metrics" },
  { number: 94, text: "Your team's eng lead says 'we don't need an A/B test for this.' Push back or agree, and why?",                                  category: "Execution + metrics", stage: "execution_metrics" },

  // Stakeholder / GTM (95–102)
  { number: 95,  text: "You are presenting to the CTO of a regulated company that blocked expansion last quarter. How do you open?",                  category: "Stakeholder / GTM", stage: "stakeholder_gtm" },
  { number: 96,  text: "Expand from 50 to 5,000 developers in one strategic account. Walk me through the motion.",                                    category: "Stakeholder / GTM", stage: "stakeholder_gtm" },
  { number: 97,  text: "A customer feedback pattern shows up five times this quarter. How do you decide it becomes product roadmap?",                 category: "Stakeholder / GTM", stage: "stakeholder_gtm" },
  { number: 98,  text: "Sales wants a custom integration two big accounts asked for. Engineering does not want to build it. Adjudicate.",             category: "Stakeholder / GTM", stage: "stakeholder_gtm" },
  { number: 99,  text: "Three customers' security teams are blocking expansion. What is your first move, and what do you escalate to product?",       category: "Stakeholder / GTM", stage: "stakeholder_gtm" },
  { number: 100, text: "A strategic customer wants a feature your product team does not want to ship. Make the call and write the one-paragraph rationale.", category: "Stakeholder / GTM", stage: "stakeholder_gtm" },
  { number: 101, text: "Design the deployment motion for an AI agent into a Fortune 100 bank — first 90 days.",                                       category: "Stakeholder / GTM", stage: "stakeholder_gtm" },
  { number: 102, text: "A pilot customer's NPS is great but they are not expanding. Diagnose.",                                                       category: "Stakeholder / GTM", stage: "stakeholder_gtm" },

  // Behavioral / values (103–114)
  { number: 103, text: "Tell me about a time you worked through real ambiguity.",                                                                     category: "Behavioral / values", stage: "behavioral_values" },
  { number: 104, text: "Tell me about a conflict with engineering that you still remember vividly.",                                                  category: "Behavioral / values", stage: "behavioral_values" },
  { number: 105, text: "Tell me about feedback that changed how you operate.",                                                                        category: "Behavioral / values", stage: "behavioral_values" },
  { number: 106, text: "Tell me about a time safety concerns changed a product decision you owned.",                                                  category: "Behavioral / values", stage: "behavioral_values" },
  { number: 107, text: "Tell me about a time you disagreed with leadership and held your position.",                                                  category: "Behavioral / values", stage: "behavioral_values" },
  { number: 108, text: "Tell me about a failure that is still operationally useful to you.",                                                          category: "Behavioral / values", stage: "behavioral_values" },
  { number: 109, text: "Tell me about a position no one else in the room was holding.",                                                               category: "Behavioral / values", stage: "behavioral_values" },
  { number: 110, text: "Tell me about a person you developed who is now better at the job than you would have been.",                                category: "Behavioral / values", stage: "behavioral_values" },
  { number: 111, text: "Tell me about a time you got something materially wrong and had to publicly correct course.",                                category: "Behavioral / values", stage: "behavioral_values" },
  { number: 112, text: "Tell me about a time you said no to a powerful stakeholder.",                                                                 category: "Behavioral / values", stage: "behavioral_values" },
  { number: 113, text: "Tell me about a time the safety or mission framing of this company would have changed a decision you made.",                  category: "Behavioral / values", stage: "behavioral_values" },
  { number: 114, text: "Tell me about a time you held a metric you were measured on as the wrong one — and what you did about it.",                  category: "Behavioral / values", stage: "behavioral_values" },

  // AI Literacy (115–128) — Technical / DASME (conceptual, engineer in the room)
  { number: 115, text: "When would you use RAG instead of fine-tuning to give a model new knowledge — and when do you combine them?",              category: "AI Literacy", stage: "technical_dasme" },
  { number: 116, text: "Explain RAG, embeddings, and re-ranking to a non-technical executive — each in under a minute.",                          category: "AI Literacy", stage: "technical_dasme" },
  { number: 117, text: "A RAG system is giving wrong answers. How do you diagnose retrieval failure versus generation failure?",                 category: "AI Literacy", stage: "technical_dasme" },
  { number: 118, text: "What makes something an agent rather than a single LLM call, and when do you actually need one?",                          category: "AI Literacy", stage: "technical_dasme" },
  { number: 119, text: "What is the Model Context Protocol (MCP), and why should a PM care?",                                                      category: "AI Literacy", stage: "technical_dasme" },
  { number: 120, text: "Long context windows keep growing. Has long context killed RAG?",                                                        category: "AI Literacy", stage: "technical_dasme" },
  { number: 121, text: "Single agent versus multi-agent: when is the added complexity of multiple agents worth it?",                            category: "AI Literacy", stage: "technical_dasme" },
  { number: 122, text: "What is context engineering, and why can it matter more than prompt wording?",                                          category: "AI Literacy", stage: "technical_dasme" },
  { number: 123, text: "What is a guardrail or classifier model, and how does it differ from the main model?",                                  category: "AI Literacy", stage: "technical_dasme" },
  { number: 124, text: "Walk me through an eval harness for an AI feature — what is offline, what is online, and why you need both.",             category: "AI Literacy", stage: "technical_dasme" },
  { number: 125, text: "Define hallucination. How would you measure the rate, and what rate would you refuse to launch above?",                 category: "AI Literacy", stage: "technical_dasme" },
  { number: 126, text: "What is LLM-as-judge, and what are its failure modes?",                                                                 category: "AI Literacy", stage: "technical_dasme" },
  { number: 127, text: "What is pass^k, and why does reliability matter more than average accuracy for agents?",                               category: "AI Literacy", stage: "technical_dasme" },
  { number: 128, text: "What is prompt injection, why does it matter more for agents than chatbots, and how does it differ from a jailbreak?", category: "AI Literacy", stage: "technical_dasme" },

  // Cost + Unit Economics (129–134) — Technical / DASME
  { number: 129, text: "Walk me through the unit economics of an LLM feature.",                                                                 category: "Cost + Unit Economics", stage: "technical_dasme" },
  { number: 130, text: "What is prompt caching, and how much does it change unit economics?",                                                   category: "Cost + Unit Economics", stage: "technical_dasme" },
  { number: 131, text: "Time to first token versus total latency: which do you optimize, and when?",                                            category: "Cost + Unit Economics", stage: "technical_dasme" },
  { number: 132, text: "How do you control cost and latency in an agent without wrecking quality?",                                             category: "Cost + Unit Economics", stage: "technical_dasme" },
  { number: 133, text: "How do you protect gross margin on an AI product as usage scales?",                                                     category: "Cost + Unit Economics", stage: "technical_dasme" },
  { number: 134, text: "Inference costs keep falling fast. How should that shape strategy and pricing?",                                        category: "Cost + Unit Economics", stage: "technical_dasme" },

  // AI Strategy (135–140) — Stakeholder / GTM
  { number: 135, text: "Build versus buy for a core AI capability: how do you decide?",                                                         category: "AI Strategy", stage: "stakeholder_gtm" },
  { number: 136, text: "What is a durable moat for an AI product when everyone can call the same models?",                                      category: "AI Strategy", stage: "stakeholder_gtm" },
  { number: 137, text: "The model provider could ship your feature as a native capability. How do you survive platform risk?",                  category: "AI Strategy", stage: "stakeholder_gtm" },
  { number: 138, text: "How do you build an AI product roadmap when the underlying models change every few months?",                            category: "AI Strategy", stage: "stakeholder_gtm" },
  { number: 139, text: "How do you build and defend a data flywheel for an AI product?",                                                        category: "AI Strategy", stage: "stakeholder_gtm" },
  { number: 140, text: "How would you price an AI feature given variable inference costs?",                                                      category: "AI Strategy", stage: "stakeholder_gtm" },
];

/**
 * Merged bank — public 140 + any extras the user defined in
 * src/content/personal.ts EXTRA_QUESTIONS. Categories are loosened
 * because extras can introduce new ones. This is the array consumed
 * by the picker form and the /questions explorer.
 */
export const QUESTIONS: ExtraQuestion[] = [
  ...PUBLIC_QUESTIONS,
  ...EXTRA_QUESTIONS,
];

export const CATEGORY_ORDER: QuestionCategory[] = [
  "Customer-Facing AI Agents",
  "Content + Recommendations",
  "Search + Retrieval",
  "Evaluation + Safety",
  "Autonomous Agents + Workflows",
  "Prediction + Analytics",
  "AI Literacy",
  "Cost + Unit Economics",
  "AI Strategy",
  "Product Sense Cases",
  "Recruiter screen",
  "Hiring manager",
  "Execution + metrics",
  "Stakeholder / GTM",
  "Behavioral / values",
];
