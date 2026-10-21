# Math Practice App

A browser-based math practice application for ages 7–12. **This repository contains Phases 1–3**: the project foundation, shared layout, home page, routing, and practice configuration. Question generation and actual practice sessions are reserved for later phases.

## Requirements

- Node.js 20.19+ or 22+
- npm

## Run locally

```bash
npm install
npm run dev
```

Open the localhost address printed by Vite, usually `http://localhost:5173/`.

## Validate Phases 1–3

```bash
npm run test
npm run lint
npm run build
npm run format:check
```

Run `npm run format` if formatting checks fail, then rerun the check. `npm run dev` requires visual verification in your browser.

## Production build

```bash
npm run build
npm run preview
```

Vite writes the static site to `dist/`; for a future Netlify deployment, set build command to `npm run build` and publish directory to `dist`.

## Organization

- `src/app`: top-level React app
- `src/components/common`: reusable components
- `src/types`: data models required by specification
- `src/test`: automated test setup
- `specification.md`: instructor-provided requirements
- `TODO.md`: instructor-provided phased checklist with verified progress

This is an individually developed class project using AI-assisted development, testing, and review. See `DEVELOPMENT_LOG.md` for the process.
