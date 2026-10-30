# Phase 6: Testing and Debugging Checklist

Use this checklist in addition to `python -m pytest -v`. Do **not** mark unobserved results as passed.

## Automated tests

1. Activate the existing `.venv` and run `python -m pytest -v` at the project root.
2. Confirm **all** tests pass; record the exact test count and any failures in `DEVELOPMENT_LOG.md`.
3. The new `tests/test_end_to_end.py` tests the full win/loss paths through Flask's API, restarting, invalid/duplicate guesses, unknown IDs, JSON validation, and serving browser assets.

## Manual browser checks

Start Flask with `python server.py` and visit `http://127.0.0.1:5000/`.

- [ ] Easy: start a game, guess correct and incorrect letters; check mask, guessed letters, remaining attempts, and drawing.
- [ ] Medium: start a game and verify state updates.
- [ ] Hard: start a game and verify state updates.
- [ ] Guess with a physical keyboard and the on-screen letter buttons.
- [ ] Confirm used letter buttons become disabled.
- [ ] Finish a game by winning; check the final message, word reveal, and disabled guesses.
- [ ] Finish a game by losing six attempts; check the full drawing, final message, and word reveal.
- [ ] Click New Game without refreshing, then verify previous guesses and the drawing reset.
- [ ] Verify layout at a narrow browser width and confirm buttons remain usable.

## Required Chrome Developer Tools evidence

1. Open the running site in Chrome. Press `F12` (or `Ctrl+Shift+I`).
2. Open the **Network** tab and select **Fetch/XHR**.
3. Start a new game, then click any letter.
4. Click the request to `/api/games/<game_id>/guess`.
5. Under **Headers**, verify its method is `POST` and the request URL matches that game's ID.
6. Under **Payload**, verify the JSON contains a single-letter `letter` value.
7. Under **Response**, verify `pattern`, `guessed_letters`, `incorrect_letters`, `remaining_guesses`, and `status` reflect the displayed game.
8. While `status` is `playing`, verify there is **no** `word` field or other answer reveal.
9. Capture a screenshot of the request/response for your final demonstration or notes. Do not include secrets.

## Evidence to record

Write down the test command and result, the browser(s) tested, one API request and its response, any issues found and how they were fixed. Keep screenshots locally for the 2–3 minute demonstration recording in Phase 8.

## Known design limitations

- Games are kept in server memory, so restarting the Flask process clears them.
- The initial word lists were created for this student implementation because the original word-list text files were not supplied.
- A Flask test client does **not** prove real browser behavior. Complete the manual checks above.
