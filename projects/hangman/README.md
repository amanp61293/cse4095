# Hangman Web Game

CSE 4095 project: Python/Flask Hangman server and HTML/CSS/JavaScript browser client.

## Status
Phases 2–4 implemented: standalone game engine, word management, and Flask REST API. The browser UI comes in Phase 5.

## Local setup (Windows PowerShell)
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m pip show Flask pytest gunicorn
```

If PowerShell prevents activation, run `.venv\Scripts\python.exe -m pip install -r requirements.txt` instead.

## Phase 2: Run core engine tests
From the project root, with the virtual environment active:
```powershell
python -m pytest tests/test_game.py -v
```

The game engine in `game.py` is independent of Flask. It accepts one letter per guess, allows six wrong guesses, and does not include the hidden word in its state until the game ends. Duplicate or malformed guesses are rejected.

## Existing Git repository
Use your already-cloned repository and its established branches. **Do not run `git init` inside an existing clone.** Move or copy this `hangman` folder into the intended location in that repository and commit changes using your existing workflow.

## Phase 3: Word management
`word_manager.py` provides `load_words(difficulty)` and `choose_word(difficulty)` for `easy`, `medium`, or `hard`. Word lists live in `words/` and contain lowercase English words, one per line. Blank lines and repeated words are handled; invalid words raise a clear error.

The instructor's word-list files were not supplied, so the Phase 3 package includes separate curated replacement lists rather than the instructor's originals.

Run all current tests from the project root:
```powershell
python -m pytest -v
```

## Phase 4: Flask REST API
Run locally from the project root:
```powershell
python server.py
```
The API is available at `http://127.0.0.1:5000`. This phase does not include a playable browser UI.

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/games` | Create a game with JSON `{"difficulty":"easy"}` |
| GET | `/api/games/<game_id>` | Retrieve current state |
| POST | `/api/games/<game_id>/guess` | Submit JSON `{"letter":"e"}` |

Successful game creation returns HTTP 201. Valid guesses and reads return HTTP 200. Invalid input or guesses after game over return HTTP 400; unknown IDs return HTTP 404. Errors are JSON with an `error` field. Game creation and guess responses include a `game_id`.

Example in a **second** PowerShell terminal (replace the ID after creating a game):
```powershell
$game = Invoke-RestMethod -Method Post -Uri http://127.0.0.1:5000/api/games -ContentType 'application/json' -Body '{"difficulty":"easy"}'
$game
Invoke-RestMethod -Method Get -Uri "http://127.0.0.1:5000/api/games/$($game.game_id)"
Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:5000/api/games/$($game.game_id)/guess" -ContentType 'application/json' -Body '{"letter":"e"}'
```

Run all automated tests:
```powershell
python -m pytest -v
```

**Limitations:** Game state is stored only in memory and will be reset on server restart. Use one worker for this design in production. Flask's development server is for local use only. No database, browser game, or leaderboard is included.

## Next phase
Phase 5 will implement the browser client using JavaScript `fetch()` against this API.

The assignment scope excludes bots, terminal clients, evaluation, and leaderboards.
