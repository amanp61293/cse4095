# Phases 9–14: testing and verification

## Local checks (PowerShell)

From the extracted `classroom-survey` root:

```powershell
npm install
npm run test
npm run typecheck
npm run lint
npm run format:check
npm run build
npm run dev
```

If Prettier reports formatting issues, run `npm run format` then repeat the format check. Do not put service-role keys in `.env`. Use the project's public URL and anon/publishable key only.

## Supabase database

No new migration required for Phases 9–14. Keep both existing migrations. Run `supabase/tests/phase9_14_security_checks.sql` in Supabase SQL Editor. Verify the five tables have RLS enabled, anon cannot read or insert `responses` or `answers`, and authenticated instructor can read responses. In Authentication settings, disable public signup; the MVP's policies allow **any authenticated user** instructor access. Use a private instructor account. Verify a non-authenticated REST request cannot retrieve results.

## Browser / persistence checklist (manual, requires your Supabase project)

1. Log in with the instructor account and visit `/dashboard`. Verify draft, active, closed and archived surveys appear with title search, status and inclusive creation-date filters. Refresh browser and ensure filters and data still work.
2. Open a survey with three valid student submissions. Open Results. Check total response count and choices' counts/percentages, including 0% values. Check the accessible numeric table under each chart, resize to phone width, and refresh results.
3. Create a survey with no responses. Results should show zero counts and no `NaN` percentages. Test unanswered handling by using an older dataset with missing answers (the current RPC requires every question to be answered). Response count includes all submitted response records, while each question's percentage is based on valid answers for that question.
4. Close and then archive a survey; verify results remain available after refreshing. Use title/date filters on the dashboard and confirm historical records appear.
5. Export CSV from a survey with multiple responses. Open in a spreadsheet program and verify one row per submission, survey metadata, timestamps, one column per question, multiline/quote escaping and UTF-8. Test values starting with `=`, `+`, `-`, or `@` to ensure no formula evaluation. Export a zero-response survey to confirm a headers-only file.
6. Duplicate a survey with both multiple-choice and true/false questions. Confirm it opens as a draft, questions and choice order are preserved, and no student submissions or results are copied. Refresh and confirm it persists.
7. Log out and open `/surveys/<id>/results` directly. It must redirect to login. In a private browser, check the anonymous client cannot read `responses`, `answers`, closed survey content, or manage surveys, but can complete an active survey using the RPC. Check duplicate token handling.
8. From keyboard only, tab through login, dashboard filters, action buttons, editor, survey choices and results. Confirm visible focus, labeled form fields, tab-accessible chart region, 44px+ touch targets and readable mobile layout. Confirm archive, delete, close and duplicate confirmation prompts.
9. Check a simulated network failure (browser DevTools offline): results and dashboard should display errors and allow refresh after restoring connectivity. Sign out/in and verify database data remains.
10. Run the SQL security checks and compare response counts in the database with the dashboard. Check persistence on a second browser/device signed into the same instructor account.

## Known limitations

- Database reads/writes, RLS enforcement and actual auth flows cannot be verified without a connected live Supabase project and instructor credentials. `npm run test` tests pure result/CSV functions; it does **not** replace end-to-end tests.
- Historical results are retained on closing and archiving; **Delete** intentionally cascades and permanently destroys survey responses, as documented in DATABASE.md.
- Draft saves and duplication perform multiple client requests (not a single database transaction). On partial failure, reload and inspect drafts before retrying. Atomic cloning would require an additional database RPC and is beyond this phase's minimal changes.
- Survey-created date filtering uses the ISO date from `created_at` (UTC); local timezone near midnight can shift the date shown in the UI.
- Anonymous token uniqueness prevents accidental re-submission in the same browser, not across devices or browsers.
