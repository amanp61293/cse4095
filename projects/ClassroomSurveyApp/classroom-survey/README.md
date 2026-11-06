# Classroom Survey Web App

A React + TypeScript classroom surveying application for CSE 4095. Instructors sign in with Supabase Auth, create and manage surveys, display classroom QR codes, and view/export responses. Students answer active surveys anonymously at `/s/:slug`. The database uses Supabase PostgreSQL with Row Level Security and transactional RPCs for activation and submission.

**Deployment status:** Source is prepared for GitHub and Cloudflare Pages. Neither a successful production build nor a live deployment is verified by this repository. Follow [DEPLOYMENT.md](DEPLOYMENT.md) and check off the manual verification tasks after testing the deployed site.

## Technologies

React 19, TypeScript, Vite 7, Tailwind CSS 4, React Router, Supabase JS, PostgreSQL, Recharts, and `qrcode`.

## Local setup (PowerShell)

1. Install Node.js compatible with Vite 7 (Node **20.19+** or **22.12+**) and Git.
2. From the `classroom-survey` folder:

```powershell
npm install
Copy-Item .env.example .env
notepad .env
```

Set the following **browser-safe** values from Supabase **Project Settings > API / Connect** (the UI wording may change):

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY
```

Never place a service-role key, `sb_secret_...` key, database password, or GitHub token in `VITE_` variables or the repository. Vite embeds `VITE_` values in the public browser bundle. Supabase RLS is essential.

3. Run:

```powershell
npm run test
npm run typecheck
npm run lint
npm run format:check
npm run build
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`. If formatting fails, use `npm run format` and re-run the format check. The app can show its landing page without Supabase keys; instructor login and survey features need a configured backend.

## Database and instructor account

1. Create your own Supabase project; do **not** assume the database is already installed.
2. Run these SQL migrations in order using **Supabase SQL Editor**:
   - `supabase/migrations/20261106000100_phase2_schema.sql`
   - `supabase/migrations/20261106000200_phase6_8_activation.sql`
3. Run the provided SQL verification scripts under `supabase/tests/` and check the expected results. See `supabase/PHASE2_SETUP.md` and `supabase/PHASE3_AUTH_SETUP.md`.
4. Under **Authentication**, disable public signups and create/confirm only trusted instructor users. **Current MVP database policies allow every authenticated account instructor-level access.** Do not permit untrusted users to register.
5. Set the Supabase Auth **Site URL** to the final production origin and add appropriate localhost/production redirect URLs in **Authentication > URL Configuration**, especially if using email confirmations or future auth flows.

The student RPC validates active survey status, selected question/choice membership, and duplicate browser tokens. Browser tokens only reduce duplicate submissions within one browser/device.

## Routes

| Path | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Landing page |
| `/login` | Public | Instructor sign-in |
| `/dashboard` | Instructor | Surveys, filters, management and history |
| `/surveys/new` | Instructor | Create draft |
| `/surveys/:id/edit` | Instructor | Edit draft |
| `/surveys/:id/present` | Instructor | Project QR and public link |
| `/surveys/:id/results` | Instructor | Results, charts and CSV |
| `/s/:slug` | Public | Anonymous active survey |

## Cloudflare Pages

The Git-connected **React (Vite)** settings are: root directory `/` if the **repository root contains `package.json`**, build command `npm run build`, output directory `dist`, production branch `main`. The `public/_redirects` file provides an SPA fallback for direct route loads. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to **Cloudflare Pages production environment variables** before building. They are public client configuration, not server secrets. Rebuild after changing them.

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for complete GitHub commands, dashboard steps, security precautions, troubleshooting, production test cases, and submission requirements.

## Specification and testing references

- [`Classroom_Survey_Web_App_Specification.md`](Classroom_Survey_Web_App_Specification.md)
- [`TODO.md`](TODO.md)
- [`DATABASE.md`](DATABASE.md)
- [`API.md`](API.md)
- [`UI.md`](UI.md)
- [`assignmentInstructions.pdf`](assignmentInstructions.pdf)
- [`PHASE9_14_TESTING.md`](PHASE9_14_TESTING.md)
- [`supabase/tests/`](supabase/tests/)

## Known constraints

- Draft editing and survey duplication use multiple client/database requests; they are not fully transactional. A partial network failure may require reloading and inspecting a draft.
- Survey deletion cascades into stored student responses. Archive instead to keep history.
- The browser token is not a unique human identity; different browsers/devices can submit independently.
- A successful local build does **not** establish that production auth, RLS, QR, storage or CSV export work. Test each in production after deployment.
- The supplied TODO may contain earlier checked items from previous work. Phase 15 external-service tasks are left unchecked unless actually verified.
