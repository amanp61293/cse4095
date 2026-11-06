"""Core Hangman rules. This module does not use Flask or browser code."""


class InvalidGuessError(ValueError):
    """A guess is empty, invalid, or already used."""


class GameOverError(ValueError):
    """A guess was attempted after the game ended."""


class HangmanGame:
    def __init__(self, word, max_incorrect_guesses=6):
        if not isinstance(word, str) or not word.isascii() or not word.isalpha():
            raise ValueError("The hidden word must contain letters A-Z only.")
        if not isinstance(max_incorrect_guesses, int) or isinstance(max_incorrect_guesses, bool) or max_incorrect_guesses < 1:
            raise ValueError("The maximum number of incorrect guesses must be positive.")

        self._word = word.lower()
        self.max_incorrect_guesses = max_incorrect_guesses
        self.guessed_letters = []
        self.incorrect_letters = []
        self.status = "playing"

    def guess(self, letter):
        """Apply one letter guess and return a browser-safe game state."""
        if self.status != "playing":
            raise GameOverError("This game is already finished.")
        if not isinstance(letter, str) or len(letter) != 1 or not letter.isascii() or not letter.isalpha():
            raise InvalidGuessError("Enter one letter from A to Z.")

        letter = letter.lower()
        if letter in self.guessed_letters:
            raise InvalidGuessError("That letter has already been guessed.")

        self.guessed_letters.append(letter)
        if letter not in self._word:
            self.incorrect_letters.append(letter)

        if all(character in self.guessed_letters for character in self._word):
            self.status = "won"
        elif len(self.incorrect_letters) >= self.max_incorrect_guesses:
            self.status = "lost"

        return self.to_state()

    def to_state(self):
        """Return only data that a client is allowed to receive."""
        pattern = " ".join(
            character if character in self.guessed_letters else "_"
            for character in self._word
        )
        state = {
            "pattern": pattern,
            "guessed_letters": self.guessed_letters.copy(),
            "incorrect_letters": self.incorrect_letters.copy(),
            "remaining_guesses": self.max_incorrect_guesses - len(self.incorrect_letters),
            "status": self.status,
        }
        if self.status != "playing":
            state["word"] = self._word
        return state
