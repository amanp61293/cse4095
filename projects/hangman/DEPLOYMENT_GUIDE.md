# Phase 7: Deploy Hangman to Render

## Before deployment

1. Keep the local project inside the **existing cloned Git repository**. Do not run `git init` or copy the downloaded ZIP's folder over a `.git` folder.
2. In PowerShell, go to the folder containing `server.py` and `requirements.txt` and activate the virtual environment if needed.
3. Run `python -m pytest -v` and confirm all tests pass locally.
4. From the cloned repository, run `git status`, `git branch --show-current`, and `git remote -v` to confirm the correct branch and remote. The user's previous pushes used branch `projects`.
5. Stage the Hangman changes from the repository root, commit, and push to that branch. For example: `git add .`, `git commit -m "Phase 7: Prepare Hangman Render deployment"`, `git push origin projects`. Check `git status` before `git add .` if other projects have changes.

## Create the Render web service

1. Visit https://dashboard.render.com/ and choose **New > Web Service**.
2. Connect the **existing GitHub repository** containing the Hangman project. Choose branch **projects** if that is the branch containing the current code.
3. Set **Language** to `Python 3` and select the desired instance plan (Free is suitable if offered).
4. **Root Directory:** Set this to the folder *relative to the repository root* that contains `server.py` and `requirements.txt`. Example: if the repository has `hangman/server.py`, use `hangman`. If the repository has `hangman_phase1/server.py`, use `hangman_phase1`. If those files are in the repository root, leave this setting blank. Do **not** enter a Windows absolute path.
5. **Build Command:** `pip install -r requirements.txt`
6. **Start Command:** `gunicorn --bind 0.0.0.0:$PORT --workers 1 server:app`
7. Create the service. Watch the deploy logs. Wait until Render reports a successful live deployment before treating this phase as complete.

The one-worker setting is necessary because the game store is an in-memory Python dictionary. Different workers would not share game state. Games also disappear on server restarts or instance shutdowns.

## Verify the public site

- Visit the HTTPS `onrender.com` address listed by Render. The Hangman homepage must load without relying on the local Flask server.
- Start Easy, Medium, and Hard games. Check a correct guess, an incorrect guess, win/loss messages, and New Game.
- In Chrome Developer Tools > Network > Fetch/XHR, inspect the game creation request and a `/guess` response. While playing, the response must not contain `word`.
- Optional PowerShell API test (replace the domain with the actual Render URL):
  ```powershell
  $base = "https://YOUR-SERVICE.onrender.com"
  $game = Invoke-RestMethod -Method Post -Uri "$base/api/games" -ContentType "application/json" -Body '{"difficulty":"easy"}'
  $game | ConvertTo-Json -Depth 5
  Invoke-RestMethod -Method Get -Uri "$base/api/games/$($game.game_id)"
  Invoke-RestMethod -Method Post -Uri "$base/api/games/$($game.game_id)/guess" -ContentType "application/json" -Body '{"letter":"e"}'
  ```
- Save the public URL for the assignment and note any issues/fixes in `DEVELOPMENT_LOG.md`.

## Troubleshooting

- **`requirements.txt` not found:** The Root Directory points to the wrong folder.
- **`ModuleNotFoundError: No module named 'server'`:** The Root Directory is wrong or the Start Command does not match the filename.
- **A new game disappears / returns 404:** A restart has cleared memory; ensure the service uses just one Gunicorn worker.
- **First load is slow:** Free Render web services may spin down after inactivity.
- **404 at `/`:** Check that Render deployed the latest branch and that the root HTML route exists in `server.py`.

Official Render documentation: https://render.com/docs/deploy-flask and https://render.com/docs/your-first-deploy
