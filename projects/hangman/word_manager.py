"""Load Hangman word lists and choose a random word for a difficulty."""

import random
from pathlib import Path


WORD_FOLDER = Path(__file__).resolve().parent / "words"
DIFFICULTIES = ("easy", "medium", "hard")


def load_words(difficulty, word_folder=WORD_FOLDER):
    """Return validated, unique words for one difficulty."""
    if not isinstance(difficulty, str) or difficulty.lower() not in DIFFICULTIES:
        raise ValueError("Difficulty must be easy, medium, or hard.")

    difficulty = difficulty.lower()
    path = Path(word_folder) / (difficulty + ".txt")
    words = []

    with path.open("r", encoding="utf-8") as file:
        for line in file:
            word = line.strip().lower()
            if not word:
                continue
            if not word.isascii() or not word.isalpha():
                raise ValueError("Invalid word in " + path.name + ": " + word)
            if word not in words:
                words.append(word)

    if not words:
        raise ValueError("No valid words found in " + path.name)
    return words


def choose_word(difficulty, word_folder=WORD_FOLDER):
    """Select a random word from the requested difficulty."""
    return random.choice(load_words(difficulty, word_folder))
