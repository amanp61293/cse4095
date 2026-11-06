# Phase 3: Instructor authentication

Phase 2 database migrations must be run separately (see `PHASE2_SETUP.md`). The frontend uses Supabase Auth directly; no instructor passwords are stored in application tables.

1. Create/open your project in https://supabase.com/dashboard.
2. In **Authentication > Providers > Email**, enable Email/Password authentication. Disable public self-signup for an instructor-only site (the exact dashboard wording may vary).
3. In **Authentication > Users**, create/invite a trusted instructor user. Set/confirm a password using the dashboard's supported flow. Do not publish credentials or include them in screenshots.
4. In **Project Settings > API** (or the project's Connect panel), copy **Project URL** and a **publishable** key (legacy `anon` key is also suitable). Never copy a service-role/secret key into Vite.
5. In the project root, copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to those public values. Restart Vite after changing environment variables.
6. Set the Auth site's URL to your local dev origin (`http://localhost:5173`) during local tests and add production origin later. Password sign-in itself doesn't depend on a redirect URL.

## Manual Phase 3 checks

- Visit `/` and follow **Instructor Login** to `/login`.
- With incorrect credentials, see a friendly error. Empty fields are blocked by browser validation.
- With a valid instructor account, log in and reach `/dashboard`; the account email appears.
- Refresh `/dashboard`: the session should persist.
- Open `/dashboard` while logged out: you should be redirected to `/login`. Signing in should return you to the dashboard.
- Click **Logout**: you return to `/login`, and reopening `/dashboard` requires login.
- Open `/login` while already signed in: you should be redirected to `/dashboard`.
- Temporarily remove public environment values and restart Vite: the homepage should load, and login should show a configuration error instead of crashing.

**Security note:** Frontend route protection is not database authorization. Apply Phase 2 RLS policies in Supabase before production. The Phase 2 policies treat any authenticated Supabase user as an instructor, so disable open signup and provision only trusted users. More restrictive instructor roles would require a separate authorization design.

Only the authentication shell is implemented. Survey listing and management belong to Phase 4; `/dashboard` is currently an authenticated placeholder.
