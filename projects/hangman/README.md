# Hangman Web Game

This is my CSE 4095 Agentic Programming assignment. I built a browser-based Hangman game with a Python game engine, a Flask REST API, and an HTML/CSS/JavaScript interface. I used AI assistance incrementally, testing each part before moving to the next.

## Project status

I have completed and locally verified Phases 1–6. Phase 7 is prepared, but I have **not yet confirmed a public Render deployment**. Phase 8, including the final report and screen recording, is still pending. See `PROJECT_OVERVIEW.md` for the development history across all eight phases and `DEVELOPMENT_LOG.md` for the work and testing evidence.

## What the application does

I can select Easy, Medium, or Hard, start a game, and guess letters using the on-screen alphabet or my keyboard. The page shows my guesses, remaining incorrect attempts, the masked word, and a six-part Hangman drawing. It shows a win/loss message and the full word when a game ends. I can start another game without reloading the page.

My Python server makes all gameplay decisions. Browser JavaScript sends HTTP requests and updates the display from the JSON response; it does **not** contain the hidden word while a game is active.

## Files

| File or folder | What I use it for |
| --- | --- |
| `game.py` | Core Hangman rules, guess validation, win/loss detection |
| `word_manager.py`, `words/` | Random words for the three difficulty levels |
| `server.py` | Flask application and REST API |
| `static/` | Browser interface: HTML, CSS, JavaScript |
| `tests/` | Game engine, word manager, API, browser-route, and integration tests |
| `Specification.md` | Original reference specification provided with the assignment |
| `TODO.md` | My reduced-scope phase checklist |
| `PROJECT_OVERVIEW.md` | Summary of work across all phases |
| `DEVELOPMENT_LOG.md` | AI prompts, implementation decisions, verification, and challenges |
| `TESTING_CHECKLIST.md` | Manual and automated testing procedures |
| `DEPLOYMENT_GUIDE.md` | GitHub/Render deployment instructions and verification |

## Run locally

I use Python and Windows PowerShell. From the folder containing `server.py`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python server.py
```

I then open `http://127.0.0.1:5000/` in my browser. If PowerShell blocks the activation script, I can use `.venv\Scripts\python.exe` to run Python commands without activating the environment.

## Run automated tests

```powershell
python -m pytest -v
```

I verified the expanded tests locally through Phase 6. I did not record an exact final pass count in this document because I do not have the terminal output here. I also verified gameplay for all difficulties, drawing updates, guesses, game completion, restarting, and an API request/JSON response in Developer Tools.

## REST API

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/games` | Create a game with `{"difficulty":"easy"}` (or medium/hard) |
| GET | `/api/games/<game_id>` | Read the current game state |
| POST | `/api/games/<game_id>/guess` | Guess a letter with `{"letter":"e"}` |

To check the API, I start `python server.py` in one terminal and run this in another:

```powershell
$game = Invoke-RestMethod -Method Post -Uri http://127.0.0.1:5000/api/games -ContentType 'application/json' -Body '{"difficulty":"easy"}'
$game | ConvertTo-Json -Depth 5
Invoke-RestMethod -Method Get -Uri "http://127.0.0.1:5000/api/games/$($game.game_id)"
Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:5000/api/games/$($game.game_id)/guess" -ContentType 'application/json' -Body '{"letter":"e"}'
```

The server validates requests, uses unique game IDs, and keeps games separate. It returns an error for malformed requests and unknown games. An active-game response does not include the secret word.

## Scope and limitations

The original specification also describes a terminal client, bots, scoring, evaluation, and leaderboards, but **the assignment explicitly excludes those parts**. I did not build them. The original word-list `.txt` files were not part of the materials I received, so I used replacement lists. Games are held in memory and reset if the server restarts; that is why my Render setup uses one Gunicorn worker.

## Deployment and submission

For Render setup and verification, I use `DEPLOYMENT_GUIDE.md`. Once I have a working public HTTPS URL, I will add it here. The required final submission also includes my GitHub repository URL, a 1–2-page PDF report with 2–3 representative AI prompts, and a 2–3-minute screen recording showing a completed game, restart, and a network request/JSON response.

**GitHub URL:** To add after confirming the final repository link.  
**Public application URL:** Not yet verified.
