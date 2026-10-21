
from pathlib import Path
from collections import Counter
from bot_examples.runner import run_cli


class MyBot:
    def __init__(self):
        self.frequency_order = "etaoinshrdlucmfwypvbgkjqxz"
        self.words = []

        # Load the instructor-provided word lists
        words_folder = Path(__file__).resolve().parent / "words"

        for difficulty in ["easy", "medium", "hard"]:
            file_path = words_folder / f"{difficulty}.txt"

            with open(file_path, "r", encoding="utf-8") as file:
                for line in file:
                    word = line.strip().lower()
                    if word.isalpha():
                        self.words.append(word)

    def choose_letter(self, state: dict) -> str:
        guessed = set(state.get("guessed_letters") or [])
        incorrect = set(state.get("incorrect_letters") or [])

        # The pattern is space-separated
        pattern = state["pattern"].split()

        # Find dictionary words that match the current game
        candidates = []

        for word in self.words:
            if len(word) != len(pattern):
                continue

            matches = True

            for index, letter in enumerate(pattern):
                if letter == "_":
                    # A revealed letter cannot be hidden elsewhere
                    if word[index] in guessed:
                        matches = False
                        break
                elif word[index] != letter:
                    matches = False
                    break

            if any(letter in word for letter in incorrect):
                matches = False

            if matches:
                candidates.append(word)

        # Count letters appearing in candidate words
        letter_counts = Counter()

        for word in candidates:
            for letter in set(word):
                if letter not in guessed:
                    letter_counts[letter] += 1

        # Guess the letter found in the most candidates
        if letter_counts:
            return max(
                letter_counts,
                key=lambda letter: (
                    letter_counts[letter],
                    -self.frequency_order.index(letter)
                )
            )

        # Fallback if no dictionary candidates remain
        for letter in self.frequency_order:
            if letter not in guessed:
                return letter

        raise RuntimeError("No letters remaining")


if __name__ == "__main__":
    raise SystemExit(run_cli(MyBot(), "My bot"))
