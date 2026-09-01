# design-engine

A personal creative designer that chooses your colour and font tailored to your mood.

Describe a project and a mood, and the Style Advisor agent proposes a colour palette and a typography pairing, checks its own work for accessibility, and revises itself if the palette fails WCAG contrast — all before showing you anything.

**Live:** https://design-engine-eight.vercel.app

## How it works

The agent (built on [eve](https://eve.dev), running on Gemini) has three tools:

- **`makePalette`** — generates a candidate palette (`background`, `text`, plus an open-ended list of accent colours) from your project description and mood.
- **`contrastCheck`** — computes the real WCAG contrast ratio between two hex colours and reports pass/fail for AA and AAA.
- **`fontPair`** — suggests a heading/body Google Fonts pairing for the mood, with a short reason.

Every request runs all three: it builds a palette, checks the background/text pair for accessibility (revising up to 3 times if it fails), and picks fonts — then presents the whole thing as visual cards (real colour swatches, pass/fail badges, a live font preview) rather than raw text or tool-call output.

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000/s](http://localhost:3000/s) to use the chat.

You'll need a `.env.local` with:

```
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

## Project layout

- `agent/` — the eve agent: `agent.ts` (model config), `instructions.md` (behaviour), `tools/` (the three tools above), `channels/eve.ts` (auth policy).
- `app/` — the Next.js chat UI, including `app/_components/style-advisor-output.tsx` for the custom palette/contrast/typography cards.

## Example prompt

<img width="750" height="1482" alt="image" src="https://github.com/user-attachments/assets/24c7261c-68d6-4d6c-a636-4d2ea62f31e0" />


## Deployment

Deployed on Vercel, connected to this repo's `main` branch. Requires `GOOGLE_GENERATIVE_AI_API_KEY` set as a Production environment variable in the Vercel project.
