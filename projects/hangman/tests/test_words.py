"""Tests for word_manager.py. No web server is required."""

import pytest

from word_manager import choose_word, load_words


@pytest.mark.parametrize("difficulty", ["easy", "medium", "hard"])
def test_builtin_word_lists_are_nonempty_and_clean(difficulty):
    words = load_words(difficulty)
    assert words
    assert len(words) == len(set(words))
    assert all(word.isascii() and word.isalpha() and word.islower() for word in words)


@pytest.mark.parametrize("difficulty", ["easy", "medium", "hard"])
def test_choose_word_is_from_correct_list(difficulty):
    assert choose_word(difficulty) in load_words(difficulty)


def test_difficulty_is_case_insensitive():
    assert load_words("EASY") == load_words("easy")


@pytest.mark.parametrize("bad", ["expert", "", None, 3, [], True])
def test_invalid_difficulty_is_rejected(bad):
    with pytest.raises(ValueError):
        load_words(bad)


def test_removes_duplicates_and_blank_lines(tmp_path):
    (tmp_path / "easy.txt").write_text("apple\nAPPLE\n\npear\n", encoding="utf-8")
    assert load_words("easy", tmp_path) == ["apple", "pear"]


@pytest.mark.parametrize("invalid", ["two words", "abc123", "naïve", "well-done"])
def test_invalid_word_is_rejected(tmp_path, invalid):
    (tmp_path / "easy.txt").write_text("apple\n" + invalid + "\n", encoding="utf-8")
    with pytest.raises(ValueError):
        load_words("easy", tmp_path)


def test_empty_list_is_rejected(tmp_path):
    (tmp_path / "easy.txt").write_text("\n", encoding="utf-8")
    with pytest.raises(ValueError, match="No valid words"):
        load_words("easy", tmp_path)


def test_missing_list_raises_file_not_found(tmp_path):
    with pytest.raises(FileNotFoundError):
        load_words("easy", tmp_path)


def test_random_selection_uses_choice(monkeypatch):
    monkeypatch.setattr("word_manager.random.choice", lambda words: words[-1])
    assert choose_word("easy") == load_words("easy")[-1]
