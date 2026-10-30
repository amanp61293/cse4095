# My Hangman Testing Checklist (Phase 6)

I used automated tests and manual browser testing. The checks below summarize what I reported verifying. For details and representative prompts, see `DEVELOPMENT_LOG.md`.

## Automated testing

- [x] I ran `python -m pytest -v` and confirmed the expanded test suite passed locally.
- [x] The tests cover game rules, word selection, Flask endpoints, malformed/duplicate guesses, active-word protection, and complete API-driven games.
- [ ] Record the exact number of passing tests if I need it for my final report (not captured in this documentation).

## Browser testing

- [x] I started games at Easy, Medium, and Hard difficulty.
- [x] I checked that correct guesses update the masked word.
- [x] I checked that wrong guesses reduce the remaining count and update the drawing.
- [x] I checked winning/losing messages and the final word reveal.
- [x] I started another game without reloading the page.
- [ ] Record a separate narrow-screen/mobile test result if I perform one; I have not documented that result.

## Chrome Developer Tools

- [x] I opened the Network panel and inspected an API request and JSON response while playing.
- [x] I confirmed that this request/response inspection worked locally.
- [ ] Save a clear recording of the request and response for the final 2–3-minute demonstration (Phase 8).

For the recording, I will open Chrome Developer Tools (`F12`), select **Network → Fetch/XHR**, click a letter, and show a `POST /api/games/<game_id>/guess` request. I will show its single-letter JSON payload and updated state response and explain that active-game responses do not reveal the answer.

## Deployment-related tests still pending

- [ ] Open the publicly deployed game with my local server stopped.
- [ ] Finish a complete game on the public URL and start another.
- [ ] Verify the three API endpoints and inspect an HTTPS request on the deployed site.

## Known limitations

I store games in server memory, so restarting the server clears them. The word lists are replacement lists because the original word-list text files were not supplied. I did not implement the out-of-scope terminal client, bots, or leaderboard.
