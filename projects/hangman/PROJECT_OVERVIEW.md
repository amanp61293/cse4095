# My Hangman Project: Development Overview

I used the provided specification, original TODO, and instructor's Cursor transcript as references, but I followed the smaller scope required for **my** CSE 4095 assignment: a Flask server and a browser-based Hangman client. I worked through one substantial phase at a time and tested the work before moving forward. This file summarizes the **whole project**. `DEPLOYMENT_GUIDE.md` covers the deployment procedure specifically.

## Phase 1: Setup and planning

I created the project folders, revised the original TODO into eight phases, prepared the Python environment and dependencies, and used my existing cloned GitHub repository. I initially ran `git init` inside the Hangman folder, which created an unnecessary nested repository. I identified that error from the missing remote/branch and removed only the newly created `.git` directory, keeping my project files and original clone intact.

## Phase 2: Game engine

I implemented `HangmanGame` in `game.py` with no Flask dependencies. It checks individual letters, tracks correct/incorrect guesses, allows six incorrect guesses, builds the masked pattern, and detects wins/losses. The answer is not included in the client-facing state until a game finishes. I confirmed that the Phase 2 automated tests passed locally.

## Phase 3: Word management

I added `word_manager.py` and three word files for Easy, Medium, and Hard. The module validates words, avoids duplicates, and randomly selects a word for the requested difficulty. Since the instructor's actual word-list text files were not supplied, I used replacement word lists. I ran the expanded tests and confirmed they passed.

## Phase 4: Flask API

I connected the engine and word manager to `server.py`. The server creates games, retrieves game state, and processes guesses through three JSON endpoints. It generates independent game IDs and handles invalid requests. I tested starting a game and guessing through PowerShell, and confirmed the API results and automated tests locally. At this point the root URL returned 404 because the browser page had not been implemented yet.

## Phase 5: Browser interface

I built the interactive page with basic HTML, CSS, and JavaScript, including difficulty selection, letter buttons and physical keyboard support, previous guesses, remaining attempts, the Hangman drawing, end messages, and starting a new game. The browser calls the Flask API using `fetch()`. I manually tested the three difficulties, drawing, game completion, and restart, and confirmed the test suite passed.

## Phase 6: Testing and debugging

I expanded automated coverage to include complete API-driven games, error conditions, duplicate/invalid guesses, and active-word privacy. I also used Chrome Developer Tools to inspect a guess request and its JSON response. I confirmed the expanded tests and Developer Tools inspection succeeded locally. I did not record the final number of passing tests, and I have not claimed a new bug fix where none was reported.

## Phase 7: Deployment (in progress)

I prepared the project for deployment to Render from the `projects` branch of my existing GitHub repository. The build command installs `requirements.txt`, and the start command uses Gunicorn with one worker because the app stores games in memory. I still need to verify the deployed URL and play a full game on the hosted site. See `DEPLOYMENT_GUIDE.md` for the exact steps.

## Phase 8: Final submission (not yet completed)

I will finalize the README and development report, record a 2–3-minute demo of the hosted game and a Developer Tools request/response, and submit my GitHub URL, public URL, PDF report, and video through HuskyCT.

## How the pieces work together

When I press New Game, JavaScript sends a request with the difficulty to Flask. Flask chooses a word, creates a `HangmanGame`, and returns a safe game state with a game ID. Each letter click or keypress sends a guess request. Flask checks the guess using the game engine and returns the new pattern, letters guessed, remaining attempts, and status. JavaScript updates the page and drawing from that response. Only when I win or lose does the server reveal the complete word.

## What I can explain in a demonstration

I can explain the difference between the server and browser responsibilities, why JSON and HTTP are used, how the word stays hidden, how the tests verify gameplay, why I used only one server worker, and how to inspect requests in Developer Tools. My main practical issues were the accidental nested Git repository and the expected 404 homepage before Phase 5.
