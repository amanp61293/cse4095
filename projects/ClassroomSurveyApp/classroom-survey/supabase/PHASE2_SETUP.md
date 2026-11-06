# Phase 2: Supabase database setup

This phase adds the database schema and secure submission RPC. **No Supabase project has been created or changed for you.** Run the migration on your own new project and perform the checks below. No application login or other later-phase functionality is implemented here.

## 1. Create the project

1. Sign in to <https://supabase.com/dashboard>, then select **New project**.
2. Choose your organization, a project name (for example, `classroom-survey`), a region near your users, and a strong database password. Store the password privately. The free plan is suitable for getting started, subject to its limits.
3. Once provisioning finishes, go to **Project Settings > API** or the project **Connect** panel. Find the **Project URL** and a *publishable* (`sb_publishable_...`) or legacy `anon` API key. Never copy `service_role`, secret API keys, database passwords, or tokens into source code.
4. For the existing Phase 1 client, the legacy `anon` key is directly compatible with `VITE_SUPABASE_ANON_KEY`. If your dashboard offers only the new publishable key, it can also be used as this value with modern Supabase JS. `VITE_` variables are public in the browser, so they must be publishable keys only.
5. Under **Authentication > Providers > Email** (dashboard labels may vary), disable **Allow new users to sign up** / public email signups. This Phase 2 single-instructor design gives *every authenticated user* instructor privileges. Only create/invite trusted instructor accounts through the dashboard later; do not leave public registration available.

## 2. Run the SQL migration

1. In **SQL Editor**, open **New query**.
2. Copy the *entire* contents of `supabase/migrations/20261106000100_phase2_schema.sql` into the query.
3. Verify you are in the correct new project. Run it **once** as the project's SQL editor administrator. It runs inside a transaction. If anything fails, the transaction rolls back.
4. In **Database > Tables** or **Table Editor**, confirm five tables: `surveys`, `questions`, `choices`, `responses`, `answers`.
5. In the **Database > Policies** screen, confirm RLS is enabled and policies exist. Run the read-only verification script below.

The migration assumes an **empty project** without those application tables/functions. It is **not** a repair script for an existing populated database. Do not execute it a second time or drop existing tables to make it pass. If a conflicting object exists, stop and inspect before changing anything.

## 3. Verify without creating permanent test data

1. In SQL Editor, run `supabase/tests/phase2_readonly_checks.sql`. It checks tables, RLS, constraints, indexes, and grants.
2. Next, run `supabase/tests/phase2_smoke_test.sql` as **one entire query**. It creates a temporary active survey and student submission in a transaction, impersonates `anon` for the read/RPC tests, validates the stored response and answer, then **ROLLBACK** removes all test data. This test requires that no other active survey is present, as it inserts a temporary active survey. It also assumes there are no existing rows using the reserved test UUIDs.
3. Check that the smoke-test result contains `{"success": true, "response_id": "..."}` and no SQL errors. If a test fails, report the exact SQL error instead of assuming success.
4. For full end-to-end security verification, later test over HTTP using an anonymous API client and an actual instructor session. The SQL smoke test covers the database roles and RPC, but it cannot verify the browser authentication flow.

## 4. Optional local frontend configuration

Copy `.env.example` to `.env` and fill in only the project URL and public key. This is optional in Phase 2; the basic Phase 1 homepage still works without database access.

```powershell
Copy-Item .env.example .env
notepad .env
```

**Never** commit `.env`, `.env.local`, database credentials, secret/service-role keys, or private instructor passwords. A public anon/publishable key is *not* an authorization bypass when RLS is correctly configured, but treat RLS checks as essential.

## 5. How the security model works

- The five database tables use UUID keys, foreign keys with the specified delete actions, indexes, timestamp defaults, and status/type validation.
- `surveys.status='active'` is restricted to a **single row** using a partial unique index. When a future activation flow is implemented, close the previous survey first inside one database transaction.
- Anonymous users can read only *active* survey metadata, questions, and choices. They cannot select instructor-only response/answer data or write directly to application tables.
- `submit_survey_response(p_survey_id, p_anonymous_token, p_answers)` is a privileged, narrowly granted RPC that checks an active survey, every required question, each selected choice, duplicate question IDs, and a nontrivial browser token. It inserts the response and its answers atomically, with a unique-index safeguard against duplicate tokens. It returns `{ "success": true, "response_id": "..." }`.
- **Token limitation:** a browser token only reduces accidental duplicate submissions. It does **not** prove identity or stop deliberate abuse. Public endpoints need abuse protection/rate limits for a real high-traffic deployment.
- Instructor permissions follow `DATABASE.md`'s single-instructor MVP guidance: all `authenticated` users can read and manage all five tables. **Disable public signups**, and do not create accounts for students. If more than one instructor is allowed later, replace the all-authenticated policies with an explicit instructor allowlist/roles system.
- The database accepts `draft`, `active`, `closed`, and `archived` survey statuses. Deleting a survey cascades to its children and submissions; archiving is safer when results should be retained.

## 6. Scope and follow-up

This phase deliberately does **not** add React login, student pages, activation/closing RPCs, charts, QR UI, or deployment. The original `TODO.md` marks many later-phase tasks as complete, but those marks have not been independently verified. Phase 2 items requiring a *real Supabase dashboard* remain unchecked until you perform the instructions and confirm the output.
