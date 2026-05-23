# interview-prep

Practice AI PM interviews end to end. Add your resume, paste the job
description, and the tool generates five interview questions tailored to
your background and that role. The coach speaks each question aloud
through ElevenLabs; you answer out loud; Whisper transcribes you; Claude
grades each answer 1-10 against real coach-rated calibration examples,
names strengths and improvements, and rewrites your answer as a stronger
version. After five questions you see an overall score, the top three
things to fix before the real loop, and a short note on what you did
well.

Questions and grading by Claude (Opus 4.7). Voice by ElevenLabs (or the
browser's built-in voice as a fallback). Transcription by Whisper (or
typing as a fallback). Resume parsed in the browser; never leaves your
machine.

The tool is also a browseable reference: seven AI PM interview rounds,
the DASME framework, sixty-four system-design questions with a
45-minute drill timer, paired 4/10-vs-9/10 calibration answers, and
company playbooks for OpenAI, Anthropic, Google DeepMind, Meta AI,
Amazon AGI, Netflix, Apple, and Nvidia.

## How to use it

1. **Add your resume.** Drag a PDF into `/interview` or click "Paste as
   text" and paste it. Parsing happens in the browser.
2. **Paste the JD** for the role you're prepping for.
3. **Run the session.** Click *Start the interview*. Five personalized
   questions get generated. For each one: the coach speaks the question,
   you click record, you answer out loud, you click stop, and you see
   your grade (score, strengths, improvements, stronger rephrase). Click
   *Next question* to continue.
4. **Read the summary** after question five: overall score, the top
   three things to change, and a paragraph of encouragement.

A full 5-question session costs roughly $0.05–0.15 in Claude tokens
thanks to prompt caching on the CV + JD context. ElevenLabs voice on the
free tier covers about 80 questions per month.

## Quick start

```bash
git clone https://github.com/kalyvask/interview-prep.git
cd interview-prep
npm install
cp .env.example .env.local
# edit .env.local — only ANTHROPIC_API_KEY is required; ELEVENLABS_API_KEY
# and OPENAI_API_KEY are optional and degrade gracefully when missing
npm run dev
```

Open <http://localhost:3000/interview> in Chrome or Edge. Allow microphone
access when prompted. Safari has limited Web Speech support.

The first run of `npm run dev` or `npm run build` copies
`src/content/personal.example.ts` to `src/content/personal.ts`
(gitignored). Edit `personal.ts` to add your own profile and anchor
stories — the grader uses them to personalize feedback.

## What's in the static reference

(no API key required; browseable at any time)

- The 7 interview rounds + 8 behavioral dimensions + 3 Laws
- DASME, the 4-layer AI system-design framework, plus 7 anti-patterns
- The model-selection table (LLM vs ML vs rules)
- The SIGNAL metric cascade (model → UX → business)
- 64 system-design questions + 8 product-sense bonuses, filterable, with
  a 45-minute drill timer that surfaces the DASME phase you should be on
- Company playbooks for OpenAI, Anthropic, Google DeepMind, Meta AI,
  Amazon AGI, Netflix, Apple, Nvidia (Anthropic includes signature
  interview questions, what to mention unprompted, what to avoid, and
  the traits they hire for)
- Four paired calibration answers — 4/10 next to 9/10 — that double as
  the scoring anchors the mock-interview grader uses

## Stack

- Next.js 16 + Turbopack
- React 19
- Tailwind CSS v4 (OKLCH theme tokens)
- TypeScript
- `@anthropic-ai/sdk` for grading + question generation (Claude Opus 4.7)
- `pdfjs-dist` for in-browser CV parsing (worker loaded from CDN)
- ElevenLabs (optional) for TTS; browser `SpeechSynthesis` fallback
- OpenAI Whisper (optional) for STT; typing fallback

## Environment variables

Only `ANTHROPIC_API_KEY` is required. The others are optional and degrade
gracefully when missing.

| Variable                 | Required | Purpose                                                       |
| ------------------------ | -------- | ------------------------------------------------------------- |
| `ANTHROPIC_API_KEY`      | yes      | Question generation, grading, follow-ups, summary             |
| `ELEVENLABS_API_KEY`     | no       | Natural-voice TTS; browser `SpeechSynthesis` is the fallback  |
| `ELEVENLABS_VOICE_ID`    | no       | Defaults to `EXAVITQu4vr4xnSDxMAi` (Sarah); see table below   |
| `OPENAI_API_KEY`         | no       | Whisper transcription of voice answers; text input is the fallback |

### ElevenLabs voice IDs

| Voice   | ID                       | Notes                            |
| ------- | ------------------------ | -------------------------------- |
| Sarah   | `EXAVITQu4vr4xnSDxMAi`   | Warm, conversational female      |
| Rachel  | `21m00Tcm4TlvDq8ikWAM`   | Professional, friendly female    |
| Adam    | `pNInz6obpgDQGcFmaJgB`   | Deep, calm male                  |
| Antoni  | `ErXwobaYiN019PkySvjV`   | Soft male, well-paced            |
| Charlie | `IKne3meq5aSn9XLyUdCD`   | Younger male, energetic          |

Browse the full library at <https://elevenlabs.io/voice-library>.

## Personal config layer

`src/content/personal.ts` (gitignored) holds your candidate profile,
anchor stories, and story-drift detection keys. The seed file
`src/content/personal.example.ts` is committed; the `predev` /
`prebuild` hook copies it to `personal.ts` the first time you run.

Schema:

```ts
PERSONAL_PROFILE: UserProfile           // name, education, experience, skills, target roles
ANCHOR_STORIES: AnchorStory[]           // each with thesis, body, metrics, follow-ups
STORY_KEYS: Record<string, StoryKeyConfig>  // regex triggers + fact patterns for drift detection
```

The drift detector (`/api/loop-consistency`) scans each round's answer
for fact mentions (`$64M`, `8 countries`, `60% turn improvement`) and
flags contradictions across rounds. Add a `STORY_KEYS` entry per anchor
story so cross-round drift surfaces during the round-mode loop.

To re-sync from the example after pulling a new version: delete
`src/content/personal.ts` and re-run `npm run dev`.

## Routes

```
/                       Hero, 3 Laws, 7 rounds, 5 shifts
/interview              Mock interview (CV + JD → 5 questions → voice → summary)
/questions              Question bank + drill timer
/frameworks             DASME, SIGNAL, model table, anti-patterns, safety, vibe
/companies              Company playbooks
/calibrations           Paired 4/10 vs 9/10 answers
```

API:

```
/api/start-interview    POST  Generate 5 personalized questions (cached CV+JD)
/api/grade              POST  Grade one answer (cached CV+JD)
/api/summary            POST  Session-end summary (cached CV+JD)
/api/tts                POST  ElevenLabs proxy; 503 if no key
/api/transcribe         POST  Whisper proxy; 503 if no key
/api/config             GET   Capability flags (booleans, no secrets)

(round-mode API, used by the consistency-checking loop)
/api/generate-questions, /api/generate-jd-questions,
/api/generate-round-questions, /api/generate-options,
/api/evaluate-answer (SSE-streaming), /api/evaluate-choice,
/api/follow-up, /api/loop-consistency
```

## Layout

```
src/
├── app/
│   ├── page.tsx                 # Home — hero, 3 Laws, 7 rounds, 5 shifts
│   ├── interview/page.tsx       # Mock interview orchestrator
│   ├── questions/               # Question bank + drill timer
│   ├── frameworks/              # DASME, SIGNAL, models, anti-patterns
│   ├── companies/               # Company playbooks
│   ├── calibrations/            # Paired 4/10 vs 9/10
│   └── api/                     # Grading + voice routes
├── components/
│   ├── site-nav.tsx
│   ├── site-footer.tsx
│   ├── session/                 # Mock interview UI (setup, audio, recorder, grade)
│   ├── interview/               # Round-mode UI (ported from interview-simulator)
│   └── shared/
├── content/
│   ├── laws.ts                  # 3 Laws, 8 dimensions, 7 rounds, 5 shifts
│   ├── questions.ts             # 72 questions across 7 categories
│   ├── companies.ts             # Company playbooks
│   ├── calibrations.ts          # Paired calibration answers
│   ├── frameworks.ts            # DASME, model table, SIGNAL, safety, vibe
│   ├── personal.example.ts      # Personal-config seed (committed)
│   └── personal.ts              # Personal config (gitignored)
├── lib/
│   ├── anthropic.ts             # Claude SDK wrapper with prompt caching
│   ├── prompts.ts               # Round-mode prompts
│   ├── session-prompts.ts       # Recipe-flow prompts
│   ├── rounds.ts                # 7 rounds + rubrics
│   ├── uncertainty.ts           # Risk / falsifier / guardrail detection
│   ├── consistency.ts           # Story-drift detection across rounds
│   ├── voice.ts                 # WPM, fillers, pacing scoring
│   ├── user-profile.ts          # Profile types + buildProfileContext
│   ├── pdf-parse.ts             # CV parsing (pdfjs-dist)
│   └── speech.ts                # Browser TTS + STT capability detection
├── context/InterviewContext.tsx # Round-mode session reducer
├── hooks/useStreamingResponse.ts
└── types/                       # Round-mode + session-mode types
```

## Cost notes

- A full 5-question session with caching: ~$0.05–0.15 in Claude tokens
- ElevenLabs free tier covers ~10K characters/month (about 80 questions
  spoken aloud)
- Whisper transcription: ~$0.006/minute; a typical answer is 1.5–3 min,
  so ~$0.01–0.02/question

## License

MIT for the code. Content is adapted from publicly available coaching
material; respect the source.
