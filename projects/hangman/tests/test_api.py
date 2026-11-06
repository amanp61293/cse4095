"""Tests for the Flask API using Flask's built-in test client."""

import pytest

import server


@pytest.fixture
def client(monkeypatch):
    server.app.config["TESTING"] = True
    server.games.clear()
    # Known word makes guessing paths predictable without affecting production.
    monkeypatch.setattr(server, "choose_word", lambda difficulty: "eagle")
    with server.app.test_client() as test_client:
        yield test_client
    server.games.clear()


def start_game(client, difficulty="easy"):
    response = client.post("/api/games", json={"difficulty": difficulty})
    assert response.status_code == 201
    return response.get_json()


def guess(client, game_id, letter):
    return client.post(f"/api/games/{game_id}/guess", json={"letter": letter})


@pytest.mark.parametrize("difficulty", ["easy", "medium", "hard", "EASY"])
def test_create_for_difficulties(client, difficulty):
    data = start_game(client, difficulty)
    assert data["pattern"] == "_ _ _ _ _"
    assert data["status"] == "playing"
    assert data["remaining_guesses"] == 6
    assert data["guessed_letters"] == []
    assert data["incorrect_letters"] == []
    assert "word" not in data
    assert data["game_id"]


def test_get_and_guess_updates_state(client):
    game_id = start_game(client)["game_id"]
    response = guess(client, game_id, "E")
    assert response.status_code == 200
    assert response.get_json()["pattern"] == "e _ _ _ e"
    assert response.get_json()["remaining_guesses"] == 6
    assert "word" not in response.get_json()

    response = guess(client, game_id, "z")
    assert response.status_code == 200
    assert response.get_json()["incorrect_letters"] == ["z"]
    assert response.get_json()["remaining_guesses"] == 5
    assert client.get(f"/api/games/{game_id}").get_json() == response.get_json()


def test_games_are_separate(client):
    first = start_game(client)["game_id"]
    second = start_game(client)["game_id"]
    assert first != second
    guess(client, first, "e")
    assert client.get(f"/api/games/{second}").get_json()["guessed_letters"] == []


@pytest.mark.parametrize("letter", ["e", "a", "g", "l"])
def test_complete_win(client, letter):
    game_id = start_game(client)["game_id"]
    for guess_letter in "eagl":
        response = guess(client, game_id, guess_letter)
    assert response.get_json()["status"] == "won"
    assert response.get_json()["word"] == "eagle"
    assert guess(client, game_id, letter).status_code == 400
    assert client.get(f"/api/games/{game_id}").get_json()["word"] == "eagle"


def test_complete_loss(client):
    game_id = start_game(client)["game_id"]
    for letter in "zxywvu":
        response = guess(client, game_id, letter)
    data = response.get_json()
    assert data["status"] == "lost"
    assert data["remaining_guesses"] == 0
    assert data["word"] == "eagle"
    assert guess(client, game_id, "e").status_code == 400


@pytest.mark.parametrize("payload", [{}, {"difficulty": "expert"}, {"difficulty": 5}, {"difficulty": None}])
def test_invalid_create_payload(client, payload):
    response = client.post("/api/games", json=payload)
    assert response.status_code == 400
    assert "error" in response.get_json()


@pytest.mark.parametrize("body,content_type", [
    ("not json", "text/plain"),
    ("{bad", "application/json"),
    ("[]", "application/json"),
    ("null", "application/json"),
])
def test_malformed_create_requests(client, body, content_type):
    response = client.post("/api/games", data=body, content_type=content_type)
    assert response.status_code == 400
    assert "error" in response.get_json()


@pytest.mark.parametrize("payload", [{}, {"letter": ""}, {"letter": "ab"}, {"letter": "4"}, {"letter": 5}, {"letter": None}])
def test_invalid_guess_payload(client, payload):
    game_id = start_game(client)["game_id"]
    response = client.post(f"/api/games/{game_id}/guess", json=payload)
    assert response.status_code == 400
    assert client.get(f"/api/games/{game_id}").get_json()["guessed_letters"] == []


def test_repeated_guess_rejected_without_changing_game(client):
    game_id = start_game(client)["game_id"]
    guess(client, game_id, "e")
    response = guess(client, game_id, "E")
    assert response.status_code == 400
    assert client.get(f"/api/games/{game_id}").get_json()["guessed_letters"] == ["e"]


def test_malformed_guess_json(client):
    game_id = start_game(client)["game_id"]
    response = client.post(f"/api/games/{game_id}/guess", data="nope", content_type="application/json")
    assert response.status_code == 400


def test_unknown_game_id(client):
    assert client.get("/api/games/missing").status_code == 404
    assert guess(client, "missing", "a").status_code == 404


def test_new_game_after_finish(client):
    first = start_game(client)["game_id"]
    for letter in "eagl":
        guess(client, first, letter)
    new = start_game(client)
    assert new["game_id"] != first
    assert new["status"] == "playing"
    assert "word" not in new


def test_create_uses_real_word_manager(client, monkeypatch):
    monkeypatch.undo()
    response = client.post("/api/games", json={"difficulty": "medium"})
    assert response.status_code == 201
    assert "word" not in response.get_json()
