# My Hangman Deployment Guide (Phase 7)

This guide is for **deploying** the application. I describe the work from Phases 1–8 in `PROJECT_OVERVIEW.md` and track implementation/testing in `DEVELOPMENT_LOG.md`.

## Deployment status

I have prepared the project and configuration, but **I have not yet verified a live Render application**. I will update this status after testing the public link.

## Before deploying

1. I keep the Hangman folder within my **existing cloned Git repository**. I do not run `git init` again or replace the repository's `.git` directory.
2. In the folder containing `server.py`, I run `python -m pytest -v` and confirm the tests pass.
3. From the repository, I check `git status`, `git branch --show-current`, and `git remote -v` to confirm my intended branch and remote. My existing GitHub work uses the `projects` branch.
4. I stage the intended Hangman changes, commit them, and push to my existing remote. I check for unrelated changes before using `git add .`.

## Render configuration

1. I go to https://dashboard.render.com/ and choose **New > Web Service**.
2. I connect the repository containing my Hangman code and select the branch where I pushed it (currently `projects`).
3. I select Python as the runtime and the available instance plan.
4. I set **Root Directory** to the *repository-relative* folder containing `server.py` and `requirements.txt`. For example, if GitHub shows `hangman/server.py`, I use `hangman`. If it shows `hangman_phase1/server.py`, I use `hangman_phase1`. I do not use a Windows path.
5. I use these commands:

   **Build:** `pip install -r requirements.txt`  
   **Start:** `gunicorn --bind 0.0.0.0:$PORT --workers 1 server:app`

6. I review the build and start logs and confirm the service actually becomes available.

I use one Gunicorn worker because my program keeps game objects in a Python dictionary. Separate processes would not share that in-memory game store, and games can be lost on server restarts.

## Verify the hosted game

Once I have the HTTPS URL from Render, I will:

- Open the site with my local Flask process stopped.
- Play Easy, Medium, and Hard games and check the drawing and remaining attempts.
- Complete a game, observe the win/loss message, and start another game without refreshing.
- Open Chrome Developer Tools, inspect a `/guess` request and its JSON response, and confirm that an active-game response does not reveal the word.
- Test the REST API on the public domain, not just on `127.0.0.1`.
- Save the public URL and document any deployment problems or corrections in `DEVELOPMENT_LOG.md`.

For example, I can replace the placeholder below with the actual Render URL:

```powershell
$base = "https://YOUR-SERVICE.onrender.com"
$game = Invoke-RestMethod -Method Post -Uri "$base/api/games" -ContentType "application/json" -Body '{"difficulty":"easy"}'
$game | ConvertTo-Json -Depth 5
Invoke-RestMethod -Method Get -Uri "$base/api/games/$($game.game_id)"
Invoke-RestMethod -Method Post -Uri "$base/api/games/$($game.game_id)/guess" -ContentType "application/json" -Body '{"letter":"e"}'
```

## Problems I might encounter

| Symptom | What I will check |
| --- | --- |
| `requirements.txt` not found | Whether Root Directory points to the correct folder |
| `No module named server` | Whether the entry-point file is `server.py` in the selected root |
| A game ID returns 404 after a restart | Whether Render restarted and cleared the in-memory games |
| Initial page loads slowly | Whether the hosting plan spins down idle services |
| The homepage is 404 | Whether the correct branch and Phase 5 `/` route are deployed |

I will document problems I actually encounter rather than listing possible problems as if they already occurred.

Official guidance: https://render.com/docs/deploy-flask
