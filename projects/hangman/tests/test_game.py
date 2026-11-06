"""Phase 2 tests for the independent Hangman game engine."""

import pytest

from game import GameOverError, HangmanGame, InvalidGuessError


def test_starting_game_is_masked_and_private():
    game = HangmanGame("eagle")
    state = game.to_state()
    assert state == {
        "pattern": "_ _ _ _ _",
        "guessed_letters": [],
        "incorrect_letters": [],
        "remaining_guesses": 6,
        "status": "playing",
    }


def test_correct_guess_reveals_every_matching_position():
    game = HangmanGame("eagle")
    state = game.guess("E")
    assert state["pattern"] == "e _ _ _ e"
    assert state["guessed_letters"] == ["e"]
    assert state["incorrect_letters"] == []
    assert state["remaining_guesses"] == 6
    assert "word" not in state


def test_wrong_guess_uses_one_attempt():
    game = HangmanGame("eagle")
    state = game.guess("z")
    assert state["pattern"] == "_ _ _ _ _"
    assert state["incorrect_letters"] == ["z"]
    assert state["remaining_guesses"] == 5
    assert state["status"] == "playing"


@pytest.mark.parametrize("bad_guess", ["", "ee", "1", "!", " ", None, 3, "é"])
def test_invalid_guesses_do_not_change_the_game(bad_guess):
    game = HangmanGame("eagle")
    with pytest.raises(InvalidGuessError):
        game.guess(bad_guess)
    assert game.to_state()["guessed_letters"] == []


def test_repeated_guess_is_rejected_without_losing_attempt():
    game = HangmanGame("eagle")
    game.guess("Z")
    with pytest.raises(InvalidGuessError):
        game.guess("z")
    assert game.to_state()["remaining_guesses"] == 5
    assert game.to_state()["guessed_letters"] == ["z"]


def test_winning_reveals_answer_and_blocks_more_guesses():
    game = HangmanGame("eagle")
    for letter in "eagl":
        state = game.guess(letter)
    assert state["status"] == "won"
    assert state["pattern"] == "e a g l e"
    assert state["word"] == "eagle"
    with pytest.raises(GameOverError):
        game.guess("z")


def test_six_wrong_guesses_end_game_and_reveal_answer():
    game = HangmanGame("eagle")
    for letter in "zxyqwv":
        state = game.guess(letter)
    assert state["status"] == "lost"
    assert state["remaining_guesses"] == 0
    assert state["word"] == "eagle"
    with pytest.raises(GameOverError):
        game.guess("e")


def test_game_state_returns_copies_of_letter_lists():
    game = HangmanGame("eagle")
    first_state = game.guess("z")
    first_state["guessed_letters"].append("e")
    first_state["incorrect_letters"].clear()
    current_state = game.to_state()
    assert current_state["guessed_letters"] == ["z"]
    assert current_state["incorrect_letters"] == ["z"]


@pytest.mark.parametrize("word", ["", "hello world", "a-b", "42", "café", None])
def test_invalid_hidden_words_are_rejected(word):
    with pytest.raises(ValueError):
        HangmanGame(word)


def test_custom_incorrect_guess_limit():
    game = HangmanGame("apple", max_incorrect_guesses=2)
    game.guess("z")
    state = game.guess("y")
    assert state["status"] == "lost"
    assert state["remaining_guesses"] == 0
