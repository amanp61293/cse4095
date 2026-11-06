# Phase 4 and 5 verification

1. Confirm the Phase 2 migration is applied in Supabase and the instructor can sign in.
2. From `classroom-survey/`, run `npm install`, `npm run typecheck`, `npm run lint`, `npm run build`, and `npm run dev`.
3. Open `/dashboard`: confirm empty state, account email, search, status filter, refresh and logout.
4. Create a draft with one multiple-choice question and two choices; save.
5. Return to the dashboard, refresh, then edit the draft and verify its title, question and choices persisted.
6. Add a true/false question. Confirm the options stay `True` and `False`. Reorder questions and multiple-choice options; save and reload.
7. Attempt to save an empty title, empty question, fewer than two choices or duplicate choices. Each must show a useful validation message.
8. Archive a draft; confirm it is still listed and cannot be edited. Do not delete important surveys while testing.
9. Confirm `New Survey` and `Edit` routes redirect to `/login` when signed out.
10. Activate/Close/Results/Duplicate remain disabled until their later phases.

Note: only the existing Phase 2 SQL should be applied to the database. This phase does not add a migration.
