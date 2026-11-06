# Phase 4: Instructor Dashboard Verification

## Prerequisites

1. Follow `PHASE2_SETUP.md` to create your Supabase project and execute the existing migration. The migration creates the five tables and authenticated instructor RLS policies.
2. Follow `PHASE3_AUTH_SETUP.md` to configure the email provider and create an instructor account. **Public signup must stay disabled** because the Phase 2 policies currently authorize every authenticated user.
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your local `.env` (never use the service-role key).

## Local checks (PowerShell)

```powershell
cd .\classroom-survey
npm install
npm run typecheck
npm run lint
npm run format:check
npm run build
npm run dev
```

## Dashboard manual test

1. Sign in at `/login`, visit `/dashboard`, and confirm an empty-state message if there are no surveys.
2. To create *test data only*, run the SQL below in the **Supabase SQL Editor**. These records are not created by the UI because survey creation belongs to Phase 5.

```sql
insert into public.surveys (title, description, status)
values
  ('Phase 4 Draft Example', 'Dashboard test', 'draft'),
  ('Phase 4 Closed Example', 'Dashboard test', 'closed');
```

3. Click Refresh. Confirm titles, status badges, and created dates are shown, newest first.
4. Search for `Draft`; confirm only the matching title appears. Clear search and filter by `Closed`.
5. Archive the **closed** example. Confirm the dialog, status changes to Archived, and its row remains visible under the Archived filter.
6. Delete the **draft** example. Confirm the warning; verify the record disappears and is gone after refreshing.
7. Turn off the network and try Refresh to verify a friendly error appears. Turn network back on and retry.
8. Confirm New Survey, Edit, Duplicate, Activate, Close, and Results are disabled with phase explanations. Confirm logout and protected routes continue working.

Optional cleanup of test data (SQL Editor):

```sql
delete from public.surveys where title in ('Phase 4 Draft Example', 'Phase 4 Closed Example');
```

**Caution:** Only run the cleanup if those titles are exclusively your test records. Test actual instructor read/update/delete permissions through a signed-in browser: the Supabase SQL Editor normally runs with elevated permissions and is not a substitute for an RLS test.

## Scope and limitations

- Phase 4 does not create migrations or alter existing RLS policies.
- No survey CRUD editor, activation workflow, QR generation, results, or duplication has been added.
- The Supabase client defaults to a finite result limit for a query. This Phase 4 implementation is suitable for the initial single-instructor use case; pagination can be added in a later enhancement.
