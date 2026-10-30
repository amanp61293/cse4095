# TODO — Web-Based Hangman Game (CSE 4095)

This implementation plan adapts the supplied Hangman specification to the reduced scope required by the assignment. Implement **one phase at a time**, test each phase before marking it complete, and commit verified changes to GitHub.

## Development rules
- Keep the Python game engine independent of Flask and the browser interface.
- The server is authoritative: never send the hidden word to the browser during active gameplay.
- Use HTTP requests and JSON responses between JavaScript and Flask.
- Keep the REST API consistent with the provided specification.
- Add tests incrementally and document changes and issues in `DEVELOPMENT_LOG.md`.
- Do not implement the terminal client, automated bots, bot evaluation, scoring, leaderboard, or replay tools. These are outside the assignment scope.

## Phase 1 — Project setup and planning
- [ ] Create the Hangman project folder and initialize Git.
- [ ] Create a GitHub repository and connect it to the local project.
- [ ] Add `Specification.md` (original reference specification) and this revised `TODO.md`.
- [ ] Create `game.py`, `word_manager.py`, `server.py` (empty placeholders initially).
- [ ] Create `static/index.html`, `static/style.css`, `static/app.js` (placeholders).
- [ ] Create the `words/` and `tests/` folders.
- [ ] Add `.gitignore`, `requirements.txt`, `README.md`, and `DEVELOPMENT_LOG.md`.
- [ ] Create a Python virtual environment and install Flask, pytest, and Gunicorn (Gunicorn will be used on Render).
- [ ] Verify the environment and record the setup in `DEVELOPMENT_LOG.md`.

**Done when:** the project structure exists, dependencies install, and the initial commit is pushed to GitHub. No game logic yet.

## Phase 2 — Core Hangman game engine
- [x] Implement the `HangmanGame` class in `game.py` without Flask dependencies.
- [x] Track hidden word, guessed letters, incorrect letters, six allowed incorrect guesses, and status.
- [x] Validate single alphabetic guesses, handle duplicates, and block guesses after game over.
- [x] Produce masked word patterns and detect wins/losses.
- [x] Return a client-safe game-state dictionary. Reveal the answer only after the game ends.
- [x] Add and run tests in `tests/test_game.py`.

**Done when:** all core rules pass tests without running a server.

## Phase 3 — Word management
- [x] Add `words/easy.txt`, `words/medium.txt`, and `words/hard.txt`.
- [x] Implement word loading, validation, duplicate handling, and random selection by difficulty.
- [x] Reject invalid difficulties and test the word manager in `tests/test_words.py`.

**Done when:** each difficulty reliably produces a valid random word.

## Phase 4 — Flask server and REST API
- [x] Implement a Flask application in `server.py`.
- [x] Store separate game instances in memory and generate unique game IDs.
- [x] Implement `POST /api/games`, `GET /api/games/<game_id>`, and `POST /api/games/<game_id>/guess`.
- [x] Validate request JSON, difficulties, guesses, and game IDs.
- [x] Return appropriate HTTP status codes and client-safe JSON responses.
- [x] Run and verify API tests in `tests/test_api.py`, including tests for hidden-word exposure (verified locally by student).

**Done when:** a complete game can be played using HTTP requests alone.

## Phase 5 — Browser interface
- [x] Implement browser UI using `static/index.html`, `static/style.css`, and `static/app.js`.
- [x] Provide difficulty selection, New Game, masked word, previous guesses, remaining guesses, and win/loss messages.
- [x] Add clickable alphabet controls and physical keyboard input.
- [x] Draw the Hangman figure and update it after incorrect guesses.
- [x] Disable already-used letters and allow restarting without refreshing the page.
- [x] Use JavaScript `fetch()` to communicate with Flask; keep all game decisions on the server.
- [x] Check usability on desktop and mobile sizes.

**Done when:** a user can start, finish, and restart games entirely in the browser. Browser implementation and automated route checks completed; local manual browser verification still needed before declaring this phase fully verified.

## Phase 6 — Testing and debugging
- [ ] Test starting games on all three difficulties.
- [ ] Test correct, incorrect, duplicate, invalid, winning, and losing guesses.
- [ ] Test new games after completion and invalid API requests.
- [ ] Verify hidden words are not sent in active-game API responses.
- [ ] Verify browser updates after each request.
- [ ] Inspect at least one request and JSON response in Chrome Developer Tools.
- [ ] Resolve bugs and document test results.

**Done when:** automated tests and manual end-to-end checks pass locally.

## Phase 7 — GitHub and cloud deployment
- [ ] Finalize deployment dependencies and startup settings for Render.
- [ ] Push verified code to GitHub.
- [ ] Deploy the Flask application to Render with a public HTTPS URL.
- [ ] Verify the homepage, required API endpoints, and full browser gameplay on Render.
- [ ] Confirm the deployed site works independently of the local computer.

**Done when:** the public application is accessible and a full game works online.

## Phase 8 — Documentation and submission
- [ ] Finalize README with local setup/run instructions and application explanation.
- [ ] Complete `TODO.md` and `DEVELOPMENT_LOG.md`.
- [ ] Write a 1–2-page PDF development report: agentic process, implementation, testing, deployment, challenge/fix, and reflection.
- [ ] Include 2–3 representative prompts in the report.
- [ ] Record a 2–3-minute demo showing public website, guesses, completed game, restart, and HTTP request/JSON response in Developer Tools.
- [ ] Submit GitHub repository URL, deployed application URL, report, and demonstration through HuskyCT.

**Done when:** every required deliverable is ready and links are accessible.
