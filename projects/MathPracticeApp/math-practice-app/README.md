# Math Practice App

React + TypeScript + Vite arithmetic practice for children ages 7–12, including question cards, sessions, browser-based statistics, mistake review, and settings.

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

## Data and privacy

Practice attempts, settings, and mistake history are stored in the browser (localStorage); active-session recovery uses sessionStorage. No account or backend is required. Clearing site data removes saved progress. Self-reported **I Got It Right / I Got It Wrong** buttons determine recorded correctness as specified, even when the selected answer differs.

## Production deployment

Run `npm run build` and `npm run preview` to inspect the production build locally. Netlify settings are in `netlify.toml` and `public/_redirects` handles SPA navigation. See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for GitHub publishing, Netlify deployment, live-site testing, and submission steps.

## Known limitations

The current question and scored counters can recover after refreshing an active session, but the selected answer and flipped card state reset. Browser-local data will not sync between devices or domains. No live deployment has been verified as part of this package.

## Phase 7: saved progress

Completed answers and sessions are saved locally in your browser under `math-practice-data`. Open **Statistics** to view aggregate accuracy and recent sessions. **Reset Statistics** erases saved attempts and completed session history after confirmation; it preserves settings and other applications' localStorage keys. Settings UI and mistake review are planned for Phase 8. Private browsing, clearing site data, or changing browsers can make saved history unavailable.

### Phase 8: Mistake practice and settings

Mistakes marked with **I Got It Wrong** are stored as reusable patterns. Select a matching operation and level in Practice Setup and switch to **Practice past mistakes** to practice related problems. Completing a review question uses the self-reported result. The mastery threshold and other preferences are on the Settings page. Your original selected answer is recorded separately from the self-reported result.

Previous browser data (storage v1) is read with v2 migration logic, preserving valid attempts and completed sessions. Mistake patterns are browser-specific; no account is required.

## Phase 9 testing notes

The app saves an unfinished session in browser `sessionStorage`. Refreshing the active practice route restores its question and counters, and Practice Setup provides a Resume button. Starting a new session replaces the unfinished one. The selected answer/flip face is not preserved; the current question is re-presented. Closing the browser may clear sessionStorage depending on browser settings.

Before deploying, run `npm install`, `npm run test`, `npm run lint`, `npm run build`, and `npm run format:check`. Test desktop/mobile widths, keyboard navigation (answer keys 1–4), zoom and reduced-motion settings manually.
