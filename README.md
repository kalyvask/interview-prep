# interview-prep

A reference and drill surface for AI PM interview rounds. Distilled from
Aakash Gupta's coaching rubric (calibrated against 200+ candidates / 30+ AI PM
offers at OpenAI, Anthropic, Google DeepMind, Meta AI, Amazon AGI).

**Live content:**

- The 7 interview rounds + 8 behavioral dimensions + 3 Laws
- The DASME framework — 4-layer system-design diagram and 7 anti-patterns
- The model-selection table (XGBoost vs LLM vs rules) — the single most
  testable piece of knowledge
- The SIGNAL metric cascade (model → UX → business)
- 64 system-design questions + 8 product-sense bonuses, filterable, with a
  45-minute drill timer that surfaces the DASME phase you should be on
- Company playbooks for OpenAI, Anthropic, Google DeepMind, Meta AI,
  Amazon AGI, Netflix, Apple, Nvidia
- Four paired calibration answers — 4/10 next to 9/10 — with annotations

## Stack

- Next.js 16 + Turbopack
- React 19
- Tailwind CSS v4 (OKLCH theme tokens)
- TypeScript
- All content is statically rendered — no backend, no database

## Design

The visual system follows the principles in
[ryanthedev/design-for-ai](https://github.com/ryanthedev/design-for-ai) and
[pbakaus/impeccable](https://github.com/pbakaus/impeccable):

- OKLCH throughout, with tinted neutrals (warm cream paper / warm dark ink)
- One intentional accent — burnt sienna — instead of a default blue, teal,
  or purple gradient
- Geist Sans for UI, Fraunces for display (variable, with `SOFT` and `WONK`
  axes engaged on the italic for the editorial feel)
- Modular type scale, generous spacing, hairline rules
- Calm easing curves, no bouncy or elastic motion
- Honest dark mode driven by `prefers-color-scheme`

## Run

```bash
npm install
npm run dev    # http://localhost:3000

npm run build
npm start
```

## Layout

```
src/
├── app/
│   ├── page.tsx                   # Home — hero, 3 Laws, 7 rounds, 5 shifts
│   ├── questions/                 # Question bank + drill timer
│   ├── frameworks/                # DASME, SIGNAL, models, anti-patterns, safety, vibe
│   ├── companies/                 # 8 company playbooks
│   └── calibrations/              # 4 paired answers (4/10 vs 9/10)
├── components/
│   ├── site-nav.tsx
│   └── site-footer.tsx
└── content/
    ├── laws.ts                    # 3 Laws, 8 dimensions, 7 rounds, 5 shifts
    ├── questions.ts               # 72 questions across 7 categories
    ├── companies.ts               # company playbooks
    ├── calibrations.ts            # paired calibration answers
    └── frameworks.ts              # DASME, model table, SIGNAL, safety, vibe
```

## Companion CLI

This UI is a study and reference surface. The companion Python CLI at
`ai-pm-interview-prep/` (separate folder) does the personalised work —
pulling stories from a wiki, ranking them by JD keywords, and assembling a
context pack to paste into a Claude chat for grading by the
`ai-pm-interview-coach` skill.

## License

MIT for the code. Content is adapted from publicly available coaching
material; respect the source.
