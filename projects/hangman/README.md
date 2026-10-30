# Hangman Web Game

CSE 4095 project: Python/Flask Hangman server and HTML/CSS/JavaScript browser client.

## Status
Phases 2 and 3 completed: standalone Hangman game engine and word management. Flask and browser gameplay are not implemented yet.

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

## Next phase
Phase 4 will add the Flask REST server. The browser interface still comes later.

The assignment scope excludes bots, terminal clients, evaluation, and leaderboards.
