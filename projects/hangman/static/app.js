// The Flask server owns the word and determines whether each guess is correct.
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const keyboard = document.getElementById("keyboard");
const pattern = document.getElementById("pattern");
const message = document.getElementById("message");
const remaining = document.getElementById("remaining");
const guessed = document.getElementById("guessed");
const incorrect = document.getElementById("incorrect");
const difficulty = document.getElementById("difficulty");
const difficultyLabel = document.getElementById("difficulty-label");
const newGameButton = document.getElementById("new-game");

let gameId = null;
let currentState = null;
let busy = false;

// Create the on-screen alphabet once, and reuse the same buttons each game.
for (const letter of alphabet) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "key";
  button.textContent = letter;
  button.setAttribute("aria-label", `Guess ${letter}`);
  button.dataset.letter = letter.toLowerCase();
  button.disabled = true;
  button.addEventListener("click", () => guessLetter(button.dataset.letter));
  keyboard.appendChild(button);
}

async function apiRequest(url, method, body) {
  const options = { method };
  if (body !== undefined) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(body);
  }
  const response = await fetch(url, options);
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an unexpected response.");
  }
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status}).`);
  }
  return data;
}

function showMessage(text, kind = "") {
  message.textContent = text;
  message.className = `message ${kind}`.trim();
}

function drawPattern(state) {
  pattern.replaceChildren();
  // The API supplies a spaced pattern, e.g. "_ e _ _ e".
  for (const character of state.pattern.split(" ")) {
    const slot = document.createElement("span");
    slot.className = "letter-slot";
    if (character !== "_") slot.classList.add("revealed");
    slot.textContent = character === "_" ? "" : character.toUpperCase();
    slot.setAttribute("aria-label", character === "_" ? "Unknown letter" : character);
    pattern.appendChild(slot);
  }
}

function renderGame(state) {
  currentState = state;
  gameId = state.game_id;
  drawPattern(state);
  remaining.textContent = state.remaining_guesses;
  guessed.textContent = state.guessed_letters.length ? state.guessed_letters.join(", ").toUpperCase() : "None yet";
  incorrect.textContent = state.incorrect_letters.length ? state.incorrect_letters.join(", ").toUpperCase() : "None yet";

  const mistakes = 6 - state.remaining_guesses;
  document.querySelectorAll("[data-part]").forEach((part) => {
    part.classList.toggle("visible", Number(part.dataset.part) <= mistakes);
  });
  document.querySelectorAll("#progress-dots span").forEach((dot, index) => {
    dot.classList.toggle("used", index < mistakes);
  });
  const playing = state.status === "playing";
  document.querySelectorAll(".key").forEach((button) => {
    const letter = button.dataset.letter;
    const alreadyGuessed = state.guessed_letters.includes(letter);
    button.disabled = busy || !playing || alreadyGuessed;
    button.classList.toggle("correct", alreadyGuessed && !state.incorrect_letters.includes(letter));
    button.classList.toggle("incorrect", state.incorrect_letters.includes(letter));
  });

  if (state.status === "won") {
    showMessage(`You won! The word was ${state.word.toUpperCase()}. Play again?`, "won");
  } else if (state.status === "lost") {
    showMessage(`Game over. The word was ${state.word.toUpperCase()}. Try again!`, "lost");
  } else {
    showMessage("Keep guessing. You've got this!");
  }
}

async function startGame() {
  if (busy) return;
  busy = true;
  newGameButton.disabled = true;
  difficultyLabel.textContent = `${difficulty.value.toUpperCase()} MODE`;
  showMessage("Starting a new game...");
  try {
    const state = await apiRequest("/api/games", "POST", { difficulty: difficulty.value });
    renderGame(state);
  } catch (error) {
    showMessage(error.message, "error");
    // Keep the previous game if starting a new game fails.
  } finally {
    busy = false;
    newGameButton.disabled = false;
    document.querySelectorAll(".key").forEach((button) => {
      button.disabled = !currentState || currentState.status !== "playing" || currentState.guessed_letters.includes(button.dataset.letter);
    });
  }
}

async function guessLetter(letter) {
  if (busy || !gameId || !currentState || currentState.status !== "playing" || currentState.guessed_letters.includes(letter)) return;
  busy = true;
  document.querySelectorAll(".key").forEach((button) => button.disabled = true);
  try {
    const state = await apiRequest(`/api/games/${encodeURIComponent(gameId)}/guess`, "POST", { letter });
    renderGame(state);
  } catch (error) {
    showMessage(error.message, "error");
  } finally {
    busy = false;
    if (currentState) {
      document.querySelectorAll(".key").forEach((button) => {
        button.disabled = currentState.status !== "playing" || currentState.guessed_letters.includes(button.dataset.letter);
      });
    }
  }
}

newGameButton.addEventListener("click", startGame);
document.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
  if (event.target instanceof HTMLElement && ["INPUT", "SELECT", "TEXTAREA"].includes(event.target.tagName)) return;
  if (/^[a-z]$/i.test(event.key)) guessLetter(event.key.toLowerCase());
});

// Open with a playable game; the New Game button can start another at any time.
startGame();
