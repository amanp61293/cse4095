# Math Practice App — GitHub and Netlify Deployment Guide

## Deployment details

- **GitHub repository:** https://github.com/amanp61293/cse4095/tree/projects
- **Application directory:** `projects/MathPracticeApp/math-practice-app`
- **Deployment branch:** `projects`
- **Live application:** https://apmathpracticeapp.netlify.app
- **Status:** Deployed to Netlify; the student confirmed the application works on the live site.

## 1. Run local checks

From the application directory in PowerShell:

```powershell
npm install
npm run test
npm run lint
npm run build
npm run format:check
npm run preview
```

The automated test suite was reported as **87 passing tests across 17 test files**, and linting and production build succeeded. A previous Prettier check flagged formatting differences; the final result of `npm run format:check` has not been confirmed in the conversation. If it reports differences, run `npm run format`, inspect the changes, and repeat `npm run format:check`.

`npm run preview` starts a local preview server; check the address printed in the terminal. Stop it with `Ctrl+C` when finished.

## 2. GitHub publishing

The project lives in the existing `cse4095` course repository on the **`projects` branch**. Preserve its `.git` folder and commit history. Do not create a replacement repository.

After making documentation changes, run the following commands from the application directory:

```powershell
git status
git add README.md DEVELOPMENT_LOG.md TODO.md DEPLOYMENT_GUIDE.md
git commit -m "Update final project documentation"
git push origin projects
```

If `git status` shows additional intended project changes, review and stage them separately. If Git reports nothing to commit, no new commit is needed.

## 3. Netlify configuration

The existing Netlify project is connected to the GitHub repository with these settings:

| Setting | Value |
| --- | --- |
| Branch to deploy | `projects` |
| Base directory | `projects/MathPracticeApp/math-practice-app` |
| Build command | `npm run build` |
| Publish directory | `dist` |
| Functions directory | Not required |

The repository contains `netlify.toml` with the build settings and an SPA redirect to `index.html`. The `public/_redirects` file also supplies a fallback for client-side routes. These support opening or refreshing app routes without a Netlify 404.

New commits to the deployed branch normally trigger a new Netlify build; check the Netlify deploy status after pushing changes.

## 4. Live-site acceptance checklist

The student has confirmed that the deployed application works. Use the checklist below to document any remaining detailed checks rather than assuming every item was independently verified:

- [ ] Open the homepage from the public URL in a new browser tab.
- [ ] Open and refresh `/practice/setup`, `/statistics`, and `/settings` directly; confirm no 404 errors.
- [ ] Complete a five-question session and compare the summary with statistics.
- [ ] Mark a question incorrect, enter mistake review, and check mastery/history behavior.
- [ ] Refresh partway through an active session and check recovery.
- [ ] Change and save a setting; refresh to confirm persistence.
- [ ] Check narrow-screen layout, keyboard answer keys 1–4, and browser console for errors.
- [ ] Check destructive-action confirmation dialogs.

**Storage note:** `localStorage` is specific to the browser and origin. Existing data from `localhost` will not automatically appear on the Netlify domain.

1. **GitHub:** https://github.com/amanp61293/cse4095/tree/projects
2. **Live application:** https://apmathpracticeapp.netlify.app

