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
