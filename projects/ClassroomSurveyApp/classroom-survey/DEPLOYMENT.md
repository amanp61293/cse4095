# Phase 15: GitHub and Cloudflare Pages deployment checklist

**Status:** Prepared, not deployed or verified here. This guide does not create a GitHub repository, Supabase project, or Cloudflare site on your behalf. Only check the deployment tasks in TODO.md after you perform and verify them.

## 1. Local preflight (PowerShell in the `classroom-survey` folder)

```powershell
node --version
npm --version
git --version
npm install
npm run test
npm run typecheck
npm run lint
npm run format:check
npm run build
```

Require Node 20.19+ or 22.12+. The production output is `dist/` and **must not be committed**. If `npm run format:check` fails, inspect changes, run `npm run format`, then rerun lint/typecheck/build. No lockfile is present in the supplied archive; `npm install` creates `package-lock.json` locally. Review and commit this lockfile for reproducible future builds. When the lockfile is committed, `npm ci` is preferred for clean local installations; Cloudflare will use its build integration to install dependencies.

### Verify secrets are excluded

```powershell
git status --short
Get-Content .gitignore
# After git init/add, review what is staged:
git diff --cached --name-only
```

Confirm `.env`, `.env.local`, `node_modules/`, `dist/`, `.DS_Store`, and all credentials are absent. Only `.env.example` is committed. Do not check in access tokens, database passwords, service-role keys, or Supabase secret API keys. Public Supabase URL and `anon`/publishable client keys will be visible in browser bundles; security comes from RLS.

## 2. Supabase setup (if you have not done it)

1. Create a project at https://supabase.com/dashboard and save the database password privately.
2. Under SQL Editor run in this order:
   - `supabase/migrations/20261106000100_phase2_schema.sql`
   - `supabase/migrations/20261106000200_phase6_8_activation.sql`
3. Run the applicable `supabase/tests/*.sql` scripts as described in their headers. Verify five tables, indexes, RLS, activation/closing RPC permissions, and the secure submission RPC. **Do not rerun create-table migrations on an already migrated database** without reviewing whether they are safe to repeat.
4. In Authentication settings enable Email auth, **disable self-service signup**, create/confirm an instructor user, and confirm that only trusted accounts have authentication access. Existing instructor RLS policies authorize the `authenticated` role generally; **they do not maintain an instructor allowlist**.
5. In project settings copy the project URL and the **public** anon/publishable key. Do not use service-role or secret keys in the web app.
6. After Cloudflare assigns the production URL, open **Authentication > URL Configuration**, set **Site URL** to `https://YOUR-PROJECT.pages.dev` (or your custom production domain), and allow your exact production origin/routes as appropriate plus `http://localhost:5173/**` for development. The app currently uses password login, not OAuth; Site URL still matters for email confirmations and possible future redirects.

The Supabase project lives separately from Cloudflare Pages. Migrating production SQL must be done in the intended production Supabase project, not just a local database.

## 3. Create and push a GitHub repository

Create a **new, empty** GitHub repository named e.g. `classroom-survey`. Do not initialize it with a remote README, .gitignore, or license if you will push this folder as an existing project. In PowerShell, from inside the extracted `classroom-survey` directory:

```powershell
git init
git branch -M main
git add .
git status --short
# Check staged files and STOP if any secrets or dist/node_modules appear.
git diff --cached --name-only
git commit -m "Prepare classroom survey for deployment"
git remote add origin https://github.com/YOUR-USERNAME/classroom-survey.git
git push -u origin main
```

If this directory **already has a Git repository or origin**, preserve its history, review `git remote -v`, commit the new changes, and use `git push`; do not blindly run `git init` / `git remote add origin` again. Authenticate through Git Credential Manager or GitHub's supported sign-in workflow. Never paste a personal access token into source files.

Repository root should be the folder containing `package.json`, `public/`, `src/`, `supabase/`, and the five specification Markdown files. The ZIP itself has a `classroom-survey/` top-level folder; do **not** push a parent folder containing only an extra `classroom-survey/` level unless you set the Cloudflare root directory accordingly.

## 4. Connect GitHub to Cloudflare Pages

1. Open https://dash.cloudflare.com/ and select **Workers & Pages**, then **Create application > Pages > Connect to Git** (labels may differ slightly).
2. Authorize GitHub, select your repository and production branch **`main`**.
3. Choose framework **React (Vite)** (or use equivalent custom settings):

   | Setting | Value |
   | --- | --- |
   | Production branch | `main` |
   | Root directory | `/` when `package.json` is at repository root |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Node version | Node 22.x (set `NODE_VERSION=22.16.0` or another supported 22.x as needed) |

4. Add **Production** environment variables before the first build:
   - `VITE_SUPABASE_URL` = Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = public anon/publishable browser key
5. **Save and Deploy.** Check Cloudflare's build logs and production deployment status. Record the actual URL `https://YOUR-PROJECT.pages.dev` (or your custom domain). If settings are edited later, trigger a **new production build** because Vite embeds them during compilation.
6. If using a custom domain, register it under the Pages project's **Custom domains**, wait for DNS/TLS readiness, and use the canonical origin in Supabase Auth Site URL.

> The `public/_redirects` file is copied to `dist/_redirects` by Vite. Its `/* /index.html 200` rule lets React Router handle page refreshes and QR deep links such as `/s/abc123`, while Cloudflare continues to serve static assets. Verify actual behavior on your deployed site.

Official references: https://developers.cloudflare.com/pages/get-started/git-integration/ and https://developers.cloudflare.com/pages/configuration/build-configuration/ and https://supabase.com/docs/guides/auth/redirect-urls .

## 5. Production test checklist (manual, required)

Record actual results/screenshots and only then update the corresponding TODO boxes.

- [ ] **Deployment and SPA paths:** Cloudflare reports a successful build. Visit `/`, `/login`, and a real `/s/:slug` by typing the URL directly and refreshing; no Cloudflare 404. Check browser console/network for missing JS/CSS.
- [ ] **Login and session:** Sign in using the trusted instructor account at the production `/login`, reach `/dashboard`, refresh and confirm login persists, then logout. Open `/dashboard` and `/surveys/:id/results` while logged out and confirm redirect to `/login`. Invalid credentials should show a friendly error.
- [ ] **Create/edit persistence:** Create a draft with multiple-choice and true/false questions, save, reload, and confirm database data survives refresh. Verify draft validation and rejection of edits to active surveys.
- [ ] **Activation and one-active rule:** Activate the draft, confirm a different active survey is closed, confirm only one `active` row exists, then check closing stops submissions.
- [ ] **QR URL:** On `/surveys/:id/present`, scan with a phone. The QR and fallback URL must start with the real production HTTPS origin, not `localhost`. Download PNG and confirm it scans to the same survey. Check presentation view on a projector-size display.
- [ ] **Anonymous submission:** Open QR URL in a private browser without signing in, answer all questions, submit, and see confirmation. Check Supabase Table Editor that one `responses` record and corresponding `answers` records were stored.
- [ ] **Duplicate defense:** Revisit in the **same browser profile** and verify duplicate submission is rejected/blocked. A different device or private session may have a different token; do not expect unique-person enforcement.
- [ ] **Instructor results:** Sign back in, view results, compare response counts and percentages against Supabase, refresh, export CSV and open it in Excel/LibreOffice. Close/archive and confirm history and date/title filtering still work.
- [ ] **Security:** In a logged-out/private browser, confirm no instructor data or results page is accessible. Run `supabase/tests/phase9_14_security_checks.sql` and `supabase/tests/phase6_8_readonly_checks.sql` in SQL Editor; ensure anonymous role cannot read responses/answers or manage surveys. An unauthenticated UI redirect alone does not prove database security.
- [ ] **Cross-device and mobile:** Verify on phone and desktop, preferably two browsers; check field labels, tab focus, touch targets and network error messages.

Do not mark the Phase 15 checkboxes as completed simply because deployment settings were added to the repo. A successful push/build/site and all production flows must be observed.

## 6. If something fails

- **Build error:** Read the Cloudflare build log first; confirm Node >= 20.19/22.12, working directory, `npm install` or lockfile state, `npm run build`, and output `dist`.
- **Blank page:** Inspect browser console and network tab; confirm Vite environment variables were set in the **production** build and were present **before** the deployment.
- **Refresh or QR link gives 404:** Check that `dist/_redirects` exists and the production deployment includes it; redeploy after correcting Pages build output.
- **Login fails:** Compare your Cloudflare public project URL/key, Supabase Auth user confirmation status, Email auth provider, and allowed origin settings.
- **Supabase permission error:** Verify both migrations and RLS policies in the correct project. Do not disable RLS or use a service-role key as a shortcut.
- **QR points at localhost:** Visit the actual production presentation page, not the local dev page. QR URL generation uses `window.location.origin` at runtime.
- **Results empty:** Confirm submitted responses are in the same Supabase project as Cloudflare's configured client and the instructor is authenticated.
- **Unexpected 403 on user routes:** Verify both backend role permissions and that the session was restored.

## 7. Assignment hand-in evidence

Keep your submitted repository URL, production URL, updated `TODO.md` with **verified** tasks, required source/specification/SQL migration files, 1–2 page development summary, AI interaction log, and screenshots of Supabase tables, stored questions/answers/responses and instructor results. Never include instructor credentials, student private data or database secrets. See `assignmentInstructions.pdf`.
