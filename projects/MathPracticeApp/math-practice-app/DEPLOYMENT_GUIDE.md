# GitHub and Netlify publishing guide

## 1. Verify locally

In PowerShell from the project root, run:

```powershell
npm install
npm run test
npm run lint
npm run build
npm run format:check
npm run preview
```

If prettier reports differences, run `npm run format`, then re-run checks, and commit only after reviewing the formatting diff. `npm run preview` serves the production build locally. Verify the local preview in the browser.

## 2. GitHub

Preserve your existing `.git` folder when copying these updated files into your local repository. Do **not** replace your original repository with a new initialized repository: its earlier commits are important evidence.

```powershell
git status
git add .
git commit -m "Prepare Phase 10 release and submission docs"
git remote -v
```

If a GitHub remote exists, use `git push -u origin HEAD`. Otherwise create an empty repository on GitHub, then run `git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git` followed by `git push -u origin HEAD`. Replace placeholders with your actual account and repository name. Confirm that README, source code, `netlify.toml`, and history are visible on GitHub.

## 3. Netlify

Sign in at https://app.netlify.com/ and select **Add new project** > **Import an existing project**, then connect the GitHub repository. Configure build command `npm run build` and publish directory `dist` (also present in `netlify.toml`). Publish the site. Netlify reads the SPA fallback from `public/_redirects` (copied into `dist`) or `netlify.toml`.

## 4. Live acceptance checks

- Open the public URL in a new browser tab and verify the landing page loads.
- Open `/practice/setup`, `/statistics`, and `/settings` directly in the address bar, then refresh each route. Confirm no Netlify 404.
- Complete a five-question session. Check that the summary and statistics agree.
- Mark an incorrect answer, review a related question, and verify saved mistake history.
- Refresh during a practice session and verify it can be resumed.
- Change a setting, refresh, and verify it persists.
- Check mobile width, keyboard input, no console errors, and confirmation dialogs for destructive actions.
- Remember that localStorage data is browser-specific and will not transfer from localhost to the deployed domain.

## 5. HuskyCT submission

Submit the verified GitHub repository URL, verified live application URL, development report PDF, and AI conversation evidence PDF. Confirm the instructor can access the public links without a login.

**Deployment and live testing are pending until the user completes these steps.**
