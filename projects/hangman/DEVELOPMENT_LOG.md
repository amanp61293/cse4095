# My Hangman Development Log

I built this project in stages using AI-assisted prompts and then verified the results locally. The original specification and instructor transcript were references, not code I copied. These prompts are **representative summaries of the requests I used in our development process**, not a verbatim exported Cursor conversation.

## Phase 1: Project setup and planning

I simplified the original 14-phase TODO to the eight phases in my assignment, leaving out the terminal client, bots, evaluation, scoring, and leaderboards. I created the folder structure and configured my Python virtual environment. I also worked within an existing GitHub repository. I accidentally initialized a separate Git repository in the Hangman subfolder, recognized the problem when Git could not find the expected remote or `projects` branch, and removed that new `.git` directory without deleting my project files.

**Representative prompt:** “Revise the instructor's Hangman TODO into a phased plan for the browser and Flask server only. Do not write the whole application yet.”

**Verification:** I confirmed that my Python environment and dependencies worked. I later confirmed GitHub contained Hangman commits on the `projects` branch.

## Phase 2: Core game engine

I implemented `HangmanGame` in `game.py`, independent of Flask. It validates a single letter, handles duplicate guesses, tracks six wrong attempts, detects game completion, and hides the answer while playing. I added `tests/test_game.py`.

**Representative prompt:** “Implement just the core Hangman engine in Python and write focused tests. Keep Flask and the browser out of this phase.”

**Verification:** I ran the Phase 2 tests locally and confirmed they passed.

## Phase 3: Word management

I created `word_manager.py` and Easy, Medium, and Hard word files. The loader validates words, ignores duplicate entries, and selects a random word for the requested difficulty. The instructor's actual word-list text files were not attached, so I used replacement word lists and documented the difference. I added `tests/test_words.py`.

**Representative prompt:** “Add word loading and random selection for all three difficulties, with validation and tests. Keep the existing game engine unchanged.”

**Verification:** I ran the expanded test suite locally and confirmed that it passed.

## Phase 4: Flask server and REST API

I connected the Python engine and word manager to a Flask server. The API supports creating games, reading their state, and submitting guesses. The server creates unique IDs, stores separate game states, validates JSON, and never exposes the secret word during active gameplay. I added API tests.

**Representative prompt:** “Implement only the Flask REST API with the three required endpoints, input validation, safe JSON state, and tests.”

**Verification:** I used PowerShell `Invoke-RestMethod` to create a game and submit a correct letter guess. I saw the masked pattern update without losing an attempt, and I confirmed the automated tests and the presence of the game ID. The root URL returned 404 at this point because the webpage had not been added yet; that was expected, not an API failure.

## Phase 5: Browser interface

I added `static/index.html`, `static/style.css`, and `static/app.js` for the playable interface. I can select a difficulty, start a game, guess through on-screen buttons or my keyboard, and view the pattern, wrong-guess count, drawing, and results. The JavaScript uses `fetch()` and does not run a second game engine. I added tests for serving the webpage and assets.

**Representative prompt:** “Build only the browser interface for the existing Flask API. Add the Hangman drawing and keyboard controls, but keep the game rules on the server.”

**Verification:** I tested all three difficulties, the drawing, guesses, correct/incorrect counter behavior, wins/losses, and restarting without refreshing. I confirmed the automated tests passed.

## Phase 6: Testing and debugging

I added `tests/test_end_to_end.py` for complete game flows and API error cases. The tests cover wins/losses, invalid and duplicate input, missing IDs, restart behavior, and the rule that active games do not reveal the answer. I also reviewed manual browser behavior and used Chrome Developer Tools to inspect a guess request and JSON response.

**Representative prompt:** “Add integration tests and a browser/Developer Tools checklist without changing the working gameplay. Do not claim unverified tests passed.”

**Verification:** I confirmed that the expanded automated suite and Developer Tools check both passed on my computer. I did not save an exact test count in this record. No further code fix was reported as necessary.

## Phase 7: Deployment preparation (not yet fully verified)

I prepared the Render deployment instructions, including the correct repository subfolder, dependency install command, and Gunicorn start command. Because my current game store is in memory, I will use one Gunicorn worker. See `DEPLOYMENT_GUIDE.md`.

**Representative prompt:** “Prepare the project for Render deployment from my existing GitHub repository. Explain the build and start settings and what to verify after deployment.”

**Verification remaining:** I still need to confirm the deployed HTTPS URL, API, and complete hosted gameplay. I have not marked this phase complete.

## Phase 8: Submission materials (pending)

I will prepare the required 1–2-page PDF report, include 2–3 representative AI prompts, and record the 2–3-minute video showing the hosted webpage, a game ending, a restart, and an API request/JSON response in Developer Tools. I will also submit my GitHub URL and Render URL through HuskyCT.

## What I learned so far

I saw how separating the game engine from Flask made the code easier to test. I also learned how the browser and server communicate using HTTP and JSON, why the server must control the hidden word, and why testing only the webpage is not enough. The Git repository issue and the expected pre-frontend 404 were useful troubleshooting experiences. I will add my deployment experience and final reflection only after I finish Phase 7.
