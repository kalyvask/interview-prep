/**
 * Personal config layer — example / seed file.
 *
 * On first dev/build, scripts/init-personal.mjs copies this file to
 * src/content/personal.ts (gitignored). Edit personal.ts with your own
 * profile, anchor stories, and drift-detection keys. The mock interview
 * routes (/api/start-interview, /api/grade, /api/summary) and the
 * round-mode consistency checker read from personal.ts via @/lib/user-profile.
 *
 * The data shape below is shaped after the prep-doc format from Alex
 * Kalyvas's OpenAI Codex DPM prep document — anchor stories with thesis,
 * body, metrics, follow-ups, and "control the risk" notes.
 */

import type {
  UserProfile,
  AnchorStory,
  StoryKeyConfig,
} from "@/lib/user-profile";

export const PERSONAL_PROFILE: UserProfile = {
  name: "Alexandros Kalyvas",
  education: [
    "Stanford GSB MBA (AI focus, 2024-2026)",
    "LSE MSc Management & Strategy",
    "Athens University BSc Business Admin & Computer Science (top 5%)",
  ],
  experience: [
    "Snowflake AI PM — Cloud Collaboration and Native Apps. Led discovery on Data Clean Room onboarding; shipped workflow simplifications; designed the platform's first sales-engineering AI agent with multi-tool execution and role-based access. Reduced enterprise time-to-value by ~50%.",
    "Amazon Sr. PM-Lead, 5+ years across EU. Built a cross-functional team from scratch (2 PMs, 5 analysts, 2 engineers). Launched ML inventory ordering models across 8 EU countries; $64M net savings, 60% turn improvement.",
    "Amazon — Built a competitor benchmarking data product; $250M incremental receipts, $150M product availability improvement across Europe.",
    "VC Associate at VentureFriends — Enterprise AI thesis, startup evaluation.",
    "IBM Business Intelligence / ML Consultant — BI for Telco and Banking.",
    "TravelTech founder (0→1, EUR 1M valuation seed, 50+ user discovery interviews).",
  ],
  skills: [
    "SQL",
    "Python",
    "JavaScript",
    "React",
    "Node.js",
    "ML / Applied AI",
    "Multi-agent systems",
    "MCP and tool use",
    "Prompt engineering",
    "Eval design",
    "Enterprise deployment",
    "Product strategy",
    "Cross-functional leadership",
  ],
  targetRoles: [
    "AI Product Manager",
    "Deployed Product Manager",
    "Senior AI PM at frontier AI labs",
  ],
  industries: [
    "Frontier AI (OpenAI, Anthropic, Sierra)",
    "Enterprise AI",
    "Developer tools",
    "Cloud / data platforms",
  ],
  yearsExperience: 8,
  seniorityLevel: "Senior PM",
  // Paste your CV as plain text here to auto-fill the /interview setup form.
  // Leave undefined to require manual upload each session.
  // cvText: `…`,
};

export const ANCHOR_STORIES: AnchorStory[] = [
  {
    key: "snowflake_ttv",
    title: "Snowflake Data Clean Room time-to-value",
    bestFor: [
      "AI PM",
      "customer discovery",
      "enterprise deployment",
      "product instincts",
      "technical collaboration",
      "turning blockers into momentum",
    ],
    thesis:
      "The core adoption blocker wasn't lack of features; it was time-to-value. Product usage, funnel instrumentation, customer calls, and technical scoping let us simplify the workflow and reduce TTV.",
    body:
      "At Snowflake I worked on Data Clean Room, a privacy-sensitive collaboration product with strong enterprise interest but customers stalling during onboarding. I used the product myself, partnered with data science to map the funnel, and validated friction through customer and sales-engineer calls. Users couldn't reach first value quickly enough because service-user setup, second-account setup, and support steps were too complex. I prioritized three simplifications: automate service-user authentication, create a clearer sandbox path, and design a support-agent flow that could guide users through setup while respecting permissions. I worked with engineering API by API to decide what the agent could do safely versus what should remain assistive. Shipped simplifications reduced time-to-value by about 50%.",
    metrics:
      "50% TTV reduction (resume figure; internal notes show 55%, projected 90% after full adoption). Two simplification initiatives shipped. Agentification launched with role-based access and eval thinking.",
    followUps: [
      "How did you define TTV?",
      "How did you prioritize the three initiatives?",
      "What permission constraints mattered?",
      "What would you do differently?",
    ],
    controlTheRisk:
      "Do not overstate the agent as fully autonomous if it was a sales-engineering / support agent. Be precise: multi-tool execution, role-based access, production agent across the sales-engineering team, goal to reduce support time.",
  },
  {
    key: "amazon_ml_ordering",
    title: "Amazon ML ordering models",
    bestFor: [
      "applied ML PM",
      "scaling",
      "metrics",
      "technical depth",
      "executive stakeholders",
      "model rollout",
    ],
    thesis:
      "I led an ML product where the hardest problem was trust and operational safety, not only model quality.",
    body:
      "At Amazon EU I led the rollout of ML-based inventory ordering models across 8 countries. I built the team from scratch (2 PMs, 5 analysts, 2 engineers) and owned the strategy, OKRs, roadmap, and reporting to EU leadership. The model influenced high-stakes inventory decisions, so I split evaluation into impact metrics and guardrails. Impact: inventory turns and cost savings. Guardrails: out-of-stock incidents, overstock, confirmation rate, operational defects. When operations pushed back, I treated it as product signal: partnered with a senior ops manager, learned that ordering patterns created inbound complexity we'd under-modeled, slowed rollout, and worked with data science to refine. We scaled after guardrails turned green.",
    metrics:
      "$64M net savings across 8 EU countries; 60% inventory turn improvement; team of 9 direct product / analytics / engineering members.",
    followUps: [
      "How did the model work?",
      "What did you personally build?",
      "What went wrong?",
      "What were the guardrail metrics?",
      "How did you influence operations?",
    ],
    controlTheRisk:
      "Use $64M (resume). Do not use older note values like $640M.",
  },
  {
    key: "skeptical_ops",
    title: "Skeptical operations director",
    bestFor: [
      "stakeholder conflict",
      "executive trust",
      "rollout risk",
      "disagreement",
      "speed vs safety",
    ],
    thesis:
      "I converted a rational skeptic by making risk visible and showing that our process could catch failures before they became systemic.",
    body:
      "During the Amazon ML ordering rollout, a senior operations director was skeptical because her team would absorb the downside if the model failed: extra labor, inbound defects, process disruption, service risk. Early pilot misses made the concern more legitimate. Instead of escalating around her, I treated her objection as product signal. We decomposed metrics by category, warehouse type, and weekly trends instead of relying on averages. We caught an over-ordering issue in Spain around seasonal spikes before it became broader, immediately informed partners, and corrected the model. That incident actually built trust because it showed we weren't forcing the model through blindly. Over time, as red issues became green and ops saw the guardrails work, the director stopped blocking and the team supported broader rollout.",
    metrics:
      "Segmented monitoring; early issue caught in Spain; adoption unlocked across warehouses and countries.",
    followUps: [
      "How did you know when to slow down?",
      "How did you communicate bad news?",
      "What would have happened without the guardrails?",
    ],
  },
  {
    key: "amazon_benchmarking",
    title: "Amazon competitor benchmarking platform",
    bestFor: [
      "0→1 product",
      "data product",
      "commercial instinct",
      "adoption",
      "GTM",
      "product from messy data",
    ],
    thesis:
      "I created a data product from existing signals and turned it into weekly operating behavior.",
    body:
      "I noticed competitors were procuring inventory from vendors where Amazon still had availability gaps. We already had many of the tables needed to understand the gap but no KPI or workflow that made it actionable for vendor owners. I built a competitor benchmarking metric that identified items available elsewhere but missing internally, attributed them to vendors, and translated the output into negotiation guidance. The product only mattered if people used it, so I integrated it into weekly business reviews and sprint follow-up.",
    metrics:
      "$250M incremental receipts; $150M product availability improvement across Europe; $3.2B supply-chain portfolio context.",
    followUps: [
      "How did you validate the KPI?",
      "How did you drive adoption?",
      "Was this a dashboard or a product?",
      "What changed in vendor behavior?",
    ],
  },
  {
    key: "tomas_pip",
    title: "Tomas PIP turnaround",
    bestFor: [
      "people leadership",
      "empathy",
      "feedback",
      "failure",
      "growth",
      "conflict",
      "manager maturity",
    ],
    thesis:
      "My first management instinct was too directive. The turnaround came when I stopped imposing my process and understood the person.",
    body:
      "I inherited a direct report, Tomas, who had relocated from Argentina and whose family depended on his income. He was underperforming and close to being let go. I first handled it like a classic performance problem: asked senior managers for advice, wrote a detailed PIP, set goals, supported him intensely. After six weeks it wasn't working. I realized I was optimizing the plan, not understanding Tomas. I extended the review period, had deeper conversations about his strengths and needs, co-created a new plan with him, and found project opportunities where his strengths could show. I trusted him with a program launch I'd designed. Within four months he was off the PIP, became a top performer, and turned into a source of support for the team.",
    metrics:
      "Off PIP within 4 months; became top performer; turned into a role model / support for the team.",
    followUps: [
      "What was your mistake?",
      "How did you receive feedback?",
      "How has this changed your management style?",
    ],
    controlTheRisk:
      "Do not over-explain Tomas's personal situation. Use it briefly to show stakes and empathy.",
  },
  {
    key: "covid_procurement",
    title: "COVID essential items procurement",
    bestFor: [
      "crisis leadership",
      "ambiguity",
      "speed",
      "community impact",
      "ownership",
    ],
    thesis:
      "I created structure quickly in a crisis and used existing commercial relationships for community impact.",
    body:
      "In March 2020, Europe faced acute shortages of N95 masks, gloves, and swab tests. I launched a workstream within 48 hours to identify distributors that could source essential items, organize account managers, create a shared tracker, and build a rapid SOP for negotiation and distribution. The team secured about EUR 5M in inventory across four European countries. The most memorable part wasn't only the commercial result; we received direct thank-you messages from nursing homes and people who couldn't access supplies elsewhere.",
    metrics:
      "EUR 5M inventory secured; 4 countries; 48-hour workstream setup.",
    followUps: [
      "How did you prioritize?",
      "What tradeoffs did you make?",
      "What would you have done differently?",
    ],
  },
  {
    key: "ai_ttv_research",
    title: "AI time-to-value research",
    bestFor: [
      "Why OpenAI",
      "enterprise AI point of view",
      "Deployed PM fit",
      "thought leadership",
    ],
    thesis:
      "Enterprise AI competition is shifting from model quality alone to implementation quality, trust, and governance.",
    body:
      "At Stanford I researched enterprise AI time-to-value through practitioner interviews and a structured questionnaire. The headline finding was that only 14% of respondents reached measurable business impact in under a month, while 50% expected that to become standard by 2027. Blockers were mostly organizational: data integration and access, change management, security / compliance, and unclear ownership. Model reliability was not the top blocker in the data. That changed how I think about AI products. A great demo is not enough; customers need deployment strategy, governance, workflow integration, and proof of value.",
    metrics:
      "14% sub-one-month impact today; 50% expectation by 2027. Blockers: integration, change management, compliance, ownership.",
    followUps: [
      "How did you collect the data?",
      "What surprised you?",
      "How would this change your Codex / AI-product deployment strategy?",
    ],
    controlTheRisk:
      "Frame this as independent research, not peer-reviewed academic proof.",
  },
  {
    key: "ai_observability_research",
    title: "AI observability research",
    bestFor: [
      "evals",
      "governance",
      "safety",
      "technical curiosity",
      "AI credibility",
    ],
    thesis:
      "Reliable agents require monitoring across logic, user feedback, automated scores, benchmarks, cost, tool use, and safety — not one magic eval.",
    body:
      "In my AI observability research I spoke with AI researchers, engineers, founders, and operators about how enterprises monitor AI systems. Among AI-native respondents, 60% reported agents already in production — much higher than public enterprise AI narratives suggest. Repeated themes were security, observability, and continual learning. Agents expand the attack surface because they access tools, data, and workflows; observability matters because you need to see why an agent took an action, which tool it used, where latency accumulated, and whether quality is drifting.",
    metrics:
      "100+ conversations; 60% of AI-native respondents reported agents in production; top concerns included security, observability, continual learning.",
    followUps: [
      "How does observability differ from traditional software monitoring?",
      "What metrics would you track for a coding agent?",
      "What is an underrated risk?",
    ],
  },
  {
    key: "traveltech_failed",
    title: "TravelTech and other failed ventures",
    bestFor: ["failure", "humility", "market validation", "founder mindset"],
    thesis:
      "My startup attempts taught me to validate markets and distribution earlier, not just build a plausible product.",
    body:
      "In TravelTech I helped build a sustainability-focused hotel booking platform from 0 to 1, led product strategy, ran discovery across 50+ users, scoped the product, and helped reach an angel-backed EUR 1M valuation before stepping back. Earlier ideas (a scholarship platform, a parking marketplace) taught me that a product can sound rational but fail if market incentives and willingness to pay are not validated early. The lesson I carry into AI deployment is to avoid confusing enthusiasm with deployment; I'd push for concrete workflow adoption, clear economic buyer value, and usage signals before declaring success.",
    metrics:
      "50+ user discovery; EUR 1M valuation seed round; stepped back after MVP.",
    followUps: [
      "What failed?",
      "What would you do differently?",
      "How does this make you better in a deployed role?",
    ],
  },
];

export const STORY_KEYS: Record<string, StoryKeyConfig> = {
  amazon_ml_ordering: {
    triggers: [
      /amazon.{0,20}(?:ml|ordering|inventory)/i,
      /\$\s?64\s?m\b/i,
      /8\s+countries/i,
    ],
    factPatterns: {
      savings: /\$\s?(\d{1,3}(?:[.,]\d+)?)\s?(?:m|million|bn|billion)\b/i,
      countries: /(\d{1,2})\s*(?:eu\s+)?countries/i,
      turns_improvement: /(\d{1,3})\s*%\s*(?:inventory\s+)?turn/i,
      team_size: /team\s+of\s+(\d{1,3})/i,
    },
  },
  snowflake_ttv: {
    triggers: [
      /snowflake/i,
      /clean\s+room/i,
      /(?:time[- ]to[- ]value|ttv)/i,
    ],
    factPatterns: {
      ttv_reduction: /(\d{1,3})\s*%\s*(?:ttv|time[- ]to[- ]value)?\s*reduction/i,
      ttv_percent: /reduced.{0,30}(?:ttv|time[- ]to[- ]value).{0,30}(\d{1,3})\s*%/i,
    },
  },
  tomas_pip: {
    triggers: [/tomas/i, /pip\b/i, /performance\s+improvement/i],
    factPatterns: {
      months_to_off_pip: /(\d{1,2})\s+months?/i,
    },
  },
  amazon_benchmarking: {
    triggers: [
      /competitor\s+benchmark/i,
      /\$\s?250\s?m/i,
      /\$\s?150\s?m/i,
    ],
    factPatterns: {
      incremental_receipts:
        /\$\s?(\d{1,3})\s?(?:m|million)\s+(?:in\s+)?(?:incremental\s+)?receipts/i,
      availability_improvement:
        /\$\s?(\d{1,3})\s?(?:m|million)\s+(?:in\s+)?(?:improved\s+)?(?:product\s+)?availability/i,
    },
  },
  covid_procurement: {
    triggers: [/covid/i, /n95/i, /48[- ]hour/i, /€\s?5\s?m\b/i],
    factPatterns: {
      inventory_secured: /(?:€|eur|\$)\s?(\d{1,3})\s?(?:m|million)/i,
      countries_count: /(\d{1,2})\s+european\s+countries/i,
      setup_hours: /(\d{1,3})[- ]hour/i,
    },
  },
  ai_ttv_research: {
    triggers: [
      /time[- ]to[- ]value\s+research/i,
      /\b14\s*%/i,
      /\b50\s*%\s*(?:by|expected)/i,
    ],
    factPatterns: {
      sub_month_pct: /(\d{1,3})\s*%\s*(?:reached|sub[- ]?month|under\s+a\s+month)/i,
      future_pct: /(\d{1,3})\s*%\s*(?:by\s+202[5-9]|standard\s+by)/i,
    },
  },
  ai_observability_research: {
    triggers: [
      /observability\s+research/i,
      /AI\s+observability/i,
      /agents?\s+(?:already\s+)?in\s+production/i,
    ],
    factPatterns: {
      conversations: /(\d{2,4})\s*\+?\s*conversations/i,
      production_pct: /(\d{1,3})\s*%\s*(?:of\s+)?(?:AI[- ]native\s+)?(?:respondents)?.{0,20}production/i,
    },
  },
  traveltech_failed: {
    triggers: [
      /traveltech/i,
      /hotel\s+booking/i,
      /scholarship\s+platform/i,
      /parking\s+marketplace/i,
    ],
    factPatterns: {
      users_interviewed: /(\d{1,3})\s*\+?\s*users?/i,
      valuation: /(?:€|eur)\s?(\d{1,3})\s?m/i,
    },
  },
};
