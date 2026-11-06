# Phases 6–8: activation, QR presentation and anonymous student surveys

## Database migration (required)

1. In **Supabase Dashboard → SQL Editor**, ensure the Phase 2 schema (`supabase/migrations/20261106000100_phase2_schema.sql`) has already been applied **once**. Do **not** rerun that non-idempotent migration if its five tables already exist.
2. Run `supabase/migrations/20261106000200_phase6_8_activation.sql` as the project owner. It adds two instructor-only RPC functions and draft-edit guards without dropping any existing tables or response data.
3. Run `supabase/tests/phase6_8_readonly_checks.sql` and confirm the five function-permission results are **true, true, false, false, true**, and anonymous read/insert results are all **false**. Confirm both named unique indexes exist.
4. Disable public user signups in **Authentication → Providers → Email**. The original Phase 2 design gives instructor permissions to *every authenticated account*; invite or create trusted instructor accounts only.
5. In **Project Settings → API**, copy only the project URL and public publishable/anon key to `.env` (see `.env.example`). Do not paste the service-role key into frontend files.

## PowerShell verification

From the extracted `classroom-survey` folder:

```powershell
npm install
npm run typecheck
npm run lint
npm run format:check
npm run build
npm run dev
```

## Browser acceptance test

1. Sign in as the instructor, create a **draft** with a multiple-choice and True/False question, and save it.
2. Click **Activate** on the dashboard. Confirm it opens `/surveys/<uuid>/present` showing a large QR code, the public `/s/<slug>` URL, a response count, and a **Download QR code** link. Test the downloaded PNG using a phone camera.
3. Open the URL in an **incognito browser** without signing in, answer both questions and submit. Confirm the thank-you page.
4. Refresh the student URL on the same browser. It should say **Already submitted**. Also try submitting again after clearing the local submitted flag or from a second tab in the same browser: the database RPC must reject a duplicate browser token.
5. On the instructor presentation page, click **Refresh count** and verify it increased by one.
6. Create and activate another draft. The first survey must become **Closed**, and its old URL must no longer accept submissions. Only the new survey may be active.
7. Close the new survey in the dashboard or presentation page. Its student URL must stop accepting responses. Attempts in progress should fail if closing commits first.
8. While a survey is active, its **Edit** action must be unavailable. Direct insertion/update of questions or choices while active should fail with `SURVEY_NOT_DRAFT` under the Phase 6–8 SQL triggers.
9. Try malformed or missing answers and confirm no response is saved. Check **Table Editor → responses/answers** to verify saved records when submissions succeed.
10. Open the student URL on a phone-sized screen and verify large answer targets and a full-width Submit button.

## Notes and limits

- The current QR URL uses `window.location.origin`, so production QR codes point to the deployed domain. Configure an SPA fallback on the host so `/s/<slug>` loads after a direct visit.
- Browser tokens prevent accidental repeated submissions from the same browser storage, but are **not identity verification** and can be bypassed using a different browser/device or clearing storage. Database-level uniqueness guarantees one response **per token per survey**.
- Anonymous users never receive direct SELECT/INSERT privileges for `responses` or `answers`; submissions go through the existing Phase 2 atomic RPC. `SURVEY_NOT_ACTIVE` and `DUPLICATE_RESPONSE` are translated into human-readable messages.
- The presentation count refreshes when you click **Refresh count**, not automatically (live results belong to later phases).
- No results dashboard or CSV export is implemented in this phase.
