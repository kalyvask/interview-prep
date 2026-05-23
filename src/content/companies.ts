export type Company = {
  slug: string;
  name: string;
  tc: string;
  passRate?: string;
  oneLiner: string;
  structure: string;
  whatTheyTest: string[];
  whereSystemThinking: string;
  redFlag: string;
  sampleQuestions: string[];
  /** Actual questions the company uses as filters; quoted from candidate / insider talks. */
  signatureQuestions?: string[];
  /** Things to bring up unprompted that signal cultural fluency. */
  whatToMention?: string[];
  /** Anti-patterns that read as not-getting-it inside this company's loop. */
  whatToAvoid?: string[];
  /** Traits hiring managers explicitly filter for. */
  hiresFor?: string[];
  /** Provenance — adapted from public talks, candidate debriefs, etc. */
  sourceNotes?: string;
};

export const COMPANIES: Company[] = [
  {
    slug: "openai",
    name: "OpenAI",
    tc: "$860K median TC",
    passRate: "<2% pass rate",
    oneLiner: "Highest technical bar in the industry. PPU-driven comp. Mirrors Meta's PM loop almost exactly.",
    structure:
      "Recruiter screen → hiring manager → final loop (behavioral, product sense, analytical, culture). For SWE roles: 60-min system design at phone screen AND onsite. PM candidates on AI-heavy teams may encounter similar depth.",
    whatTheyTest: [
      "Specific model architectures — they will probe.",
      "AGI-timeline thinking baked into product decisions.",
      "Safety embedded inside product sense, not separated into its own round.",
      "Real math during prioritization.",
    ],
    whereSystemThinking:
      "Inside product sense. Separate model-layer from app-layer. Address safety without being prompted.",
    redFlag: "No named architectures. Vague 'AI for X' answers. Treating safety as an afterthought.",
    sampleQuestions: [
      "Design the system for a real-time coding agent",
      "Build the architecture for a multi-modal research assistant",
      "How would you design the retrieval system for ChatGPT's memory feature?",
      "Design a system that identifies and mitigates hallucinations at scale",
    ],
  },
  {
    slug: "anthropic",
    name: "Anthropic",
    tc: "$468K median TC",
    oneLiner:
      "Safety-first lab. The PM role is 'AGI-pill' — first-principles thinking from the technology, not pattern-matching from past PM titles.",
    structure:
      "8–9 rounds including take-home. Product sense, analytics, behavioral, culture/values, dedicated AI safety & ethics round. Hires for taste in users, taste in technology, comfort with ambiguity. Title-agnostic culture — everyone is 'a member of technical staff'.",
    whatTheyTest: [
      "Safety as design constraint, not a checkbox. If you don't volunteer safety thinking → auto −2.",
      "First-principles answers. They distrust the 'I am a PM because I have done these PM things' pattern.",
      "Calibrated risk-taking. 'Not shipping is also a decision.' Show how you decide what to bet on.",
      "Ambition framed in % of GDP, not 5% metric movement.",
      "Evals are the PRD. Show you can write the eval that measures whether your bet worked.",
      "Hands-on with the technology. They expect you to have dogfooded Claude on real work — not just demoed it.",
      "Model-layer vs application-layer literacy in every answer.",
    ],
    whereSystemThinking:
      "Inside product sense, behavioral, and the safety round. Every product answer should frame how a feature builds user trust without losing the long-term capability bet. Technical roles also get practical inference-API and GPU-server problems.",
    redFlag:
      "Safety mentioned only when prompted. Pitching features that exist at OpenAI (imagegen / videogen are explicit non-bets). 'User-led' framing where you fulfill every customer ask instead of being 'user-centric'. Using Claude on the take-home (explicit constraint).",
    sampleQuestions: [
      "Design the evaluation system for Claude's tool use capabilities",
      "Build an agent system for enterprise workflow automation",
      "How would you architect a jailbreak detection system?",
      "Design a churn prediction and intervention system for Claude API users",
    ],
    signatureQuestions: [
      "What is something you believe about this technology that is not a widely shared opinion? — used as a primary filter. Answers that pattern-match what every podcast guest says fail.",
      "What would you build if Claude 8 worked perfectly? — surfaces 10x / 100x thinking vs next-quarter feature requests.",
      "Walk us through a calculated risk you took where you knew the downside up front. — frames risk as portfolio, not as 'we'll figure it out'.",
      "What's the eval that would tell you the bet was wrong? — if you can't name it, you don't really have a strategy.",
    ],
    whatToMention: [
      "Frame ambition in % of GDP terms, not point-improvements.",
      "Familiarity with 'AI 2027' and 'Situational Awareness' essays — handed as required reading to offered candidates.",
      "'Evals are the PRD.' In AI products the measurement is the spec.",
      "'High conviction on the theme, low conviction on the exact product experience.'",
      "'Scaling the exponential' — capabilities that are general and novel, not 1–2% accuracy gains.",
      "Recursive self-improvement as the underlying lab bet — even if you push back, signal you've thought about it.",
      "Concrete dogfooding stories: reading individual user-feedback transcripts before a launch, not just dashboard reviews.",
      "User-centric vs user-led distinction (build what users don't yet know they want from this capability).",
    ],
    whatToAvoid: [
      "Pitching imagegen / videogen as obvious roadmap. They're explicit non-bets; 'why are some boxes crossed out?' is the wrong instinct.",
      "Generic 'frontier AI' language. Specific bets beat vibes.",
      "Pattern-matching from a Big-Tech PM ladder. There is no manager-of-managers-of-PMs layer.",
      "Optimizing for an engagement metric in your product-sense answer — that's the alignment org's pushback to make, not yours to amplify.",
      "Using Claude on the take-home. Explicit constraint.",
      "Sales-style 'we'll add that' answers to every customer request.",
    ],
    hiresFor: [
      "Likes puzzles — comfortable with the technology as an open question.",
      "First-principles, not pattern-matching. Strongest hires often have limited traditional PM background but strong user + technical taste.",
      "Surprises the interviewer on the 'unshared opinion' question.",
      "Calibrated-risk mindset; comfortable naming the downside.",
      "Title-agnostic; 'member of technical staff' fluency.",
    ],
    sourceNotes:
      "Anthropic-specific signals adapted from a 2026 GSB guest talk by Anthropic's Head of Product. Structure / TC / sample questions remain from earlier candidate debriefs.",
  },
  {
    slug: "google-deepmind",
    name: "Google DeepMind",
    tc: "$425K median TC",
    passRate: "~50% committee approval",
    oneLiner: "Standalone technical interview removed for PMs — fluency is tested inside other rounds.",
    structure:
      "Initial → skills → final → decision. Virtual-first. Role-specific guidance shared in advance. Technical PM roles get written exercises and 30–45 min rounds.",
    whatTheyTest: [
      "Earning the respect of engineers — system thinking that holds up.",
      "Googleyness round = where safety + values get tested.",
      "Process matters as much as the answer; structured thinking above all.",
      "Vibe coding round active in India, expanding globally.",
    ],
    whereSystemThinking:
      "Inside product sense and Googleyness. 'Can you explain your AI design to a grandmother?' is a real probe.",
    redFlag: "Skipping the explainability question. Process-free leaps to a solution.",
    sampleQuestions: [
      "Design the ranking system for YouTube Shorts recommendations",
      "Build the system architecture for Gemini's multi-modal reasoning",
      "Architect a search system combining traditional retrieval with LLM re-ranking",
      "Design an AI agent for Google Workspace that handles email triage",
    ],
  },
  {
    slug: "meta-ai",
    name: "Meta AI",
    tc: "$563K median TC",
    oneLiner: "New 'Product Sense with AI' round for IC6+. Outsourcing your thinking to AI = rejection.",
    structure:
      "Product sense, analytical thinking, behavioral. Added 'Product Sense with AI' round in 2025–2026 for IC6+ and M1/M2 levels. SWE: 45-min system design + AI-assisted coding round (deployed 2026).",
    whatTheyTest: [
      "Critique AI suggestions during the interview — don't accept blindly.",
      "ML-specific metrics in the analytical round (precision, recall, F1). Every claim has a number.",
      "Architecture that handles billions-of-users scale by default.",
    ],
    whereSystemThinking:
      "Embedded across rounds. Analytical round is data-driven, ML-fluent. 50% of Meta PMs have non-technical degrees — skills > credentials.",
    redFlag: "Accepting AI-generated suggestions without critique. Hand-wave on scale.",
    sampleQuestions: [
      "Design a content recommendation system using LLMs for understanding and ML models for ranking",
      "Build the architecture for a multi-language AI moderation system",
      "Design AI-generated post summaries at scale",
      "Design an AI agent that helps creators optimize their Reels content",
    ],
  },
  {
    slug: "amazon-agi",
    name: "Amazon AGI",
    tc: "$325K median TC",
    oneLiner: "Leadership Principles govern everything. Dive Deep + Ownership. Cost obsession in system design.",
    structure:
      "Around the 16 Leadership Principles. STAR mandatory. PR/FAQ exercise 48 hours before onsite. Bar Raiser has veto. 45–60 min per round.",
    whatTheyTest: [
      "Customer Obsession, Ownership, Dive Deep — most-tested for AI roles.",
      "Cost-optimized architecture as a system-design domain alongside scale, reliability, security.",
      "Build vs buy as a frequent probe.",
      "Building and reasoning with AI agents — not just classifiers.",
    ],
    whereSystemThinking:
      "Dedicated system-design rounds. Alexa+, Amazon Q, conversational AI in scope.",
    redFlag: "Weak Leadership Principle stories. Architectures that ignore unit economics.",
    sampleQuestions: [
      "Design the system architecture for Alexa's proactive suggestion engine",
      "Build an AI agent for sellers on Amazon Marketplace",
      "Architect a fraud detection system using both ML and LLM components",
      "Design automated product listing optimization using AI",
    ],
  },
  {
    slug: "netflix",
    name: "Netflix",
    tc: "$586K median TC",
    oneLiner: "Unanimous approval. Keeper Test. Culture memo is mandatory reading.",
    structure: "Any single negative vote kills candidacy. Culture-alignment tested throughout.",
    whatTheyTest: [
      "Whether your manager would fight to retain you.",
      "ML platform PMs: deep ML infra knowledge.",
      "Culture-memo alignment in every answer.",
    ],
    whereSystemThinking: "ML platform interviews push hard on infrastructure (training, serving, eval).",
    redFlag: "Skipping the culture memo. Generic answers to 'what would your manager say?'",
    sampleQuestions: [
      "Design the recommendation system for Netflix originals",
      "Architect an A/B testing platform for ML models at Netflix scale",
    ],
  },
  {
    slug: "apple",
    name: "Apple",
    tc: "$301K median TC",
    oneLiner: "8–12 rounds. On-device AI, edge compute, model compression, privacy-first design.",
    structure: "Most comprehensive process. 45–60 min technical screen with senior engineer.",
    whatTheyTest: [
      "Privacy as a primary constraint, not a feature.",
      "On-device inference, quantization, edge tradeoffs.",
      "User empathy + privacy threaded through every round.",
    ],
    whereSystemThinking:
      "Technical screen explicitly tests on-device system thinking. Cloud-first architectures lose points.",
    redFlag: "Cloud-only AI architectures. Ignoring quantization or distillation as options.",
    sampleQuestions: [
      "Design an on-device personalization system for the Photos app",
      "Architect a privacy-preserving health insights system",
    ],
  },
  {
    slug: "nvidia",
    name: "Nvidia",
    tc: "$262K median TC",
    oneLiner: "Highest technical bar of any company. GPU + CUDA questions. 5+ hours back-to-back.",
    structure: "Long technical loops. Architecture, compute, kernel-level thinking.",
    whatTheyTest: [
      "GPU computing architecture and CUDA fluency.",
      "Endurance — multi-hour back-to-back rounds.",
    ],
    whereSystemThinking: "All of it. PMs without compute fluency are filtered early.",
    redFlag: "Surface-level GPU knowledge. Confusing memory hierarchy.",
    sampleQuestions: [
      "Design a training-data pipeline that saturates 8x H100 nodes",
      "Architect an inference-serving stack across heterogeneous GPUs",
    ],
  },
];
