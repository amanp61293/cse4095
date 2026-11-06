# Classroom Survey

Phase 1 starter for the CSE 4095 Classroom Survey Web App. React, TypeScript, Vite, Tailwind CSS, React Router, Supabase client, Recharts, and `qrcode` are configured as dependencies. Only the basic landing page is implemented.

## Requirements

Node.js 20.19+ or 22.12+ and npm.

## Start locally (PowerShell)

```powershell
cd .\classroom-survey
npm install
npm run dev
```

Open the local URL printed by Vite. To check the setup:

```powershell
npm run typecheck
npm run lint
npm run format:check
npm run build
```

To configure Supabase **later**, copy `.env.example` to `.env` and enter a Supabase URL and public anon key. Do not use a service-role key. Phase 1 does not need Supabase credentials to display the home page.

## Scope

Phase 1 includes only setup and a homepage. Login, instructor dashboard, database migrations, surveys, QR display, results, and deployment belong to later phases. Routing is ready, but only `/` is defined. The inactive "Instructor Login" indicator is intentionally not a working navigation link.

## Note about starter project

This baseline was created from the supplied specifications because no existing Vite starter files were attached. Do not overwrite a local project without comparing/merging files first. Supplied TODO statuses were preserved as provided; they are not an independently verified record of completed later phases.

## Phase 2: Supabase database schema (added)

Phase 2 includes the five-table migration, RLS policies, secure anonymous submission RPC, and SQL verification scripts. **No live Supabase database has been provisioned or migrated automatically.** Follow [`supabase/PHASE2_SETUP.md`](supabase/PHASE2_SETUP.md) to create a new project, run the migration in Supabase SQL Editor, and test it. The React app has not been extended beyond its Phase 1 landing page.

**Note:** The original TODO marks Phase 2 schema tasks complete, but a real database setup and permission tests must still be performed in your Supabase project. Keep all later-phase TODO statuses untouched until you review them.

## Phase 3: Instructor login

Implemented `/login`, a protected `/dashboard` authentication shell, Supabase Auth context, session restoration, logout, and login redirects. See [`supabase/PHASE3_AUTH_SETUP.md`](supabase/PHASE3_AUTH_SETUP.md) for dashboard configuration and manual verification. No survey dashboard features have been implemented. The uploaded edits to `supabase/tests/phase2_readonly_checks.sql` were retained.

## Phase 4: Instructor dashboard

The protected `/dashboard` now lists surveys from Supabase by newest creation date and displays title, status, description (when present), and creation date. Search and status filtering run locally on the fetched survey list. Refresh reloads from Supabase. In this phase **Archive** and **Delete** are implemented as authenticated database mutations with confirmation, loading feedback, error handling, and list refresh. Active surveys cannot be archived/deleted through the dashboard. Delete is permanent and cascades to questions, choices, responses, and answers; prefer Archive when responses should be retained.

**Not implemented yet:** New Survey and Edit (Phase 5), Activate/Close and public presentation (Phase 6), Results (Phase 9), Duplicate (Phase 12). These controls are visible and disabled rather than linking to nonexistent functionality. Existing Supabase RLS policies require an instructor account to load or mutate surveys. See `supabase/PHASE4_DASHBOARD_TESTING.md`.

## Phases 4 and 5: Dashboard and survey editor

With the Phase 2 migration applied, a confirmed instructor account, and `.env` configured,
run `npm install`, `npm run typecheck`, `npm run lint`, `npm run build`, and `npm run dev`.
Sign in at `/login`, then use `/dashboard` to list, search, and filter surveys.
Select **New Survey** to create a draft, or **Edit** on an existing draft.
You can add, remove, and reorder questions and multiple-choice choices; true/false
choices are fixed. Press **Save Draft** and refresh to verify persistence.

Only drafts are editable. Archive and Delete require confirmation; deleting
also deletes responses due to the existing database's cascade constraints.
Activation, closing, presentation, result viewing, and duplication controls
are placeholders for later phases and are intentionally disabled.

**Storage note:** The editor saves through several Supabase requests, not one
transaction. If a request fails midway, correct the issue, reload the draft,
and retry. Do not use the editor for a survey that is active or collecting
responses. Database enforcement for concurrent state changes and atomic editing
would require a later dedicated RPC/permission-hardening migration.


## Phases 6–8 (activation, QR codes, and student participation)

Run `supabase/migrations/20261106000200_phase6_8_activation.sql` in Supabase SQL Editor **after** the Phase 2 schema migration, then run `supabase/tests/phase6_8_readonly_checks.sql`. Instructor activation and closing use authenticated RPCs; student submissions use the original secure Phase 2 RPC and a persistent browser token. The public student route is `/s/:slug`. View the QR presentation at `/surveys/:id/present`.

See [PHASE6_8_TESTING.md](PHASE6_8_TESTING.md) for setup and PowerShell testing.


## Phases 9–14 (local results, history, CSV and tests)

The authenticated dashboard now links to results for every survey status, supports title/status/created-date filtering and duplication to a new draft (without student responses). The results page shows response counts, answer totals, percentages, missing answers, Recharts bars, numeric tables and CSV export. The CSV includes survey metadata and escapes potential spreadsheet formulas.

Run `npm run test`, `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run build`. No new SQL migration is necessary; original Phase 2 and Phase 6–8 migrations are retained. See `PHASE9_14_TESTING.md` for the SQL security checks and the manual end-to-end checklist. Production deployment is outside this phase.
