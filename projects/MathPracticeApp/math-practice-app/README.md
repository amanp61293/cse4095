# Math Practice App

A React, TypeScript, and Vite web application for children ages 7–12 to practice addition, subtraction, multiplication, and division. Students can choose one or more operations, four difficulty levels, and fixed-length or continuous sessions.

**Live application:** https://apmathpracticeapp.netlify.app  
**GitHub repository (course project branch):** https://github.com/amanp61293/cse4095/tree/projects

## Features

- Four-option multiple-choice question cards with answer selection, card flipping, explanations, and **self-reported** results using **I Got It Right** / **I Got It Wrong**, as required by the specification.
- Five-, ten-, twenty-question, and continuous practice sessions with progress and summaries.
- Browser-stored practice history, accuracy statistics by operation and difficulty, and a reset option with confirmation.
- Mistake-pattern tracking, similar-question review, prioritization, and configurable mastery thresholds (three correct similar answers by default).
- Settings for sound, animation, explanations, default difficulty, operations, and session length.
- Responsive layout, keyboard answer shortcuts (1–4), and reduced-motion support.
- Recovery of the current question and scored totals when refreshing an active practice session in the same browser session.

## Requirements and local development

Use a current Node.js LTS release compatible with Vite. From **this folder**, which contains `package.json`, run:

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite.

## Tests and production build

```powershell
npm run test
npm run lint
npm run build
npm run format:check
npm run preview
```

If formatting needs correction, run `npm run format`, review the changes, and repeat the checks.

**Recorded verification:** In final local testing, all **87 tests across 17 test files passed**; ESLint and the production build also passed. A later Prettier run reported formatting differences in 47 files. The final formatting check should be rerun after cleanup; it is not claimed as passing here. An `npm audit` run reported three advisories affecting Vitest development dependencies. No forced breaking upgrade was applied.

## How the data works

Completed attempts, practice history, settings, and mistake patterns use browser `localStorage`. Temporary active-session recovery uses `sessionStorage`. Progress does not transfer between devices, browsers, or the localhost and deployed domains. Clearing browser data removes saved progress.

Correctness is deliberately **self-reported**, not inferred from the selected multiple-choice option. This matches the supplied software specification.

A review session can end before its selected question count if all matching mistake patterns become mastered. The default mastery threshold is three correctly self-reported similar questions. This observed behavior is documented in `DEVELOPMENT_LOG.md`.

## Project organization

- `src/math/`: arithmetic, answer choices, session logic, and mistake patterns
- `src/components/practice/`: interactive question card and setup selectors
- `src/pages/`: pages for setup, practice, summary, settings, and statistics
- `src/storage/`: browser data persistence
- `src/types/`: shared TypeScript types
- `specification.md`: supplied feature requirements
- `TODO.md`: original numbered requirements checklist with completion status
- `DEVELOPMENT_LOG.md`: prompts, implementation decisions, testing, and debugging evidence
- `DEPLOYMENT_GUIDE.md`: GitHub, Netlify, and submission instructions

## Deployment

The application is published on Netlify. The deployment uses the `projects` branch of the course repository, with base directory `projects/MathPracticeApp/math-practice-app`, build command `npm run build`, and publish directory `dist`. The SPA fallback is configured for direct page refreshes. See `DEPLOYMENT_GUIDE.md`.

## Known limitations

The selected option and flipped face are reset on refresh, even when the active question and counters are recovered. Browser data is local to that origin. Full screen-reader, multiple-browser, and large-history stress testing have not been independently documented. See the TODO checklist for remaining verification and optional enhancements.
