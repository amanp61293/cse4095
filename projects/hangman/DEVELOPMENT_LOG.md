# Development Log

## Phase 1: Project setup and planning
- Adapted the provided original specification and TODO to the assignment's browser-only scope.
- Prepared directories for `static/`, `words/`, and `tests/` and placeholder module files.
- Added Python dependency list and Git ignore rules.
- **Pending local verification:** virtual environment creation, dependency installation, Git initialization, GitHub repository creation, first push.

### Representative AI prompt
"Revise the instructor's Hangman TODO into a phased implementation plan for only the Python game engine, Flask REST API, browser interface, testing, and cloud deployment. Do not implement the application yet."

### Test status
No application code or automated tests yet. Initial files are scaffolding only.

## Phase 2: Core game engine
- Implemented `HangmanGame` in `game.py` as plain Python, without Flask or UI dependencies.
- Stores the answer privately; tracks guessed and incorrect letters, remaining guesses, and `playing` / `won` / `lost` status.
- Case-insensitive single-letter ASCII guesses, duplicate protection, and game-over protection.
- Client-safe `to_state()` reveals `word` only when the game is finished. Returned lists are copies so callers cannot change internal state.
- Added `tests/test_game.py` covering initial state, correct/wrong guesses, repeated or invalid guesses, wins/losses, and privacy.

### Representative AI prompt
"Implement only Phase 2 of my browser-based Hangman assignment: a beginner-friendly Python HangmanGame class in game.py, independent of Flask. Track guesses and six incorrect attempts, reject bad or duplicate guesses, detect wins and losses, and return a state dictionary that hides the answer until the game ends. Add focused pytest tests without starting Phase 3."

### Testing
Run `python -m pytest tests/test_game.py -v` in the project environment. The phase ZIP was validated with the automated tests in the build environment.

### Note about Git
The local Python setup was reported successful by the student. The status of the existing cloned repository and any Phase 1 push should be checked locally; the generated ZIP does not contain a `.git` folder.

## Phase 3: Word management
- Added `word_manager.py` with `load_words()` and `choose_word()`; supports easy, medium, hard.
- Loads words relative to the module location so it works regardless of current working directory.
- Normalizes to lowercase, skips empty lines, removes duplicates, and rejects non-ASCII or non-alphabetic words.
- Uses `random.choice()` for word selection. Invalid difficulty and missing/empty files fail clearly.
- Added curated word lists in `words/` because the instructor's original three text files were **not attached**. These are substitutes, not copies of the original word lists.
- Added isolated tests in `tests/test_words.py`, without modifying the tested Phase 2 game engine.

### Representative AI prompt
"Implement only Phase 3: add clean word lists for easy, medium, and hard, plus a beginner-friendly word_manager.py that loads, validates, deduplicates and randomly chooses words. Keep the existing game engine untouched and add pytest tests. Document that the instructor's word lists were not provided."

### Testing
Run `python -m pytest -v` locally. After verification, commit through the existing cloned Git repository. No new `git init` is needed.
