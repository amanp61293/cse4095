# Math Practice App

React + TypeScript + Vite arithmetic practice for ages 7–12. Revised Phase 6 includes playable multiple-choice question cards, self-reported scoring, finite and continuous practice sessions, and a session summary.

## Run locally

Requires Node.js 20.19+ or 22+. In a terminal in this folder:

```bash
npm install
npm run dev
```

Open the localhost URL shown in the terminal. Navigate to **Start Practice**, select operations, difficulty, and a session length, and select **Start Session**. Choose an answer, flip the card, and self-report correct or incorrect. Five-, ten-, and twenty-question sessions end automatically. Continuous sessions end using **End Session**.

## Tests and checks

```bash
npm run test
npm run lint
npm run build
npm run format:check
```

For format warnings: `npm run format` followed by `npm run format:check`. Check browser functionality on narrow screens and with a keyboard.

## Architecture

- `src/math/`: question generation, answer distractors, session state helpers
- `src/components/practice/`: selectors and interactive question card
- `src/pages/`: setup, playable session, summary, navigation pages
- `src/types/`: shared data contracts
- `TODO.md`: instructor's original requirements checklist, retained and updated
- `DEVELOPMENT_LOG.md`: implementation prompts, debugging and verification evidence

## Current limitations

Sessions and results are not yet persisted. Refreshing a session or summary returns to setup or an empty state. Statistics and mistake-review features will be implemented in later stages. The card has an animation-disable prop and honors reduced-motion settings; the settings UI is not yet available.

## Build and deploy (later phase)

`npm run build` generates `dist/`. A hosting platform may require an SPA rewrite for client-side routes.
