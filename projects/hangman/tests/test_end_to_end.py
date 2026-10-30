"""End-to-end checks of gameplay through the public Flask endpoints.

These use Flask's local test client, not an external deployed server.
"""

import pytest

import server


@pytest.fixture
def client(monkeypatch):
    server.app.config["TESTING"] = True
    server.games.clear()
    # Predictable five-letter word makes full-game tests repeatable.
    monkeypatch.setattr(server, "choose_word", lambda difficulty: "eagle")
    with server.app.test_client() as test_client:
        yield test_client
    server.games.clear()


def new_game(client, difficulty="easy"):
    response = client.post("/api/games", json={"difficulty": difficulty})
    assert response.status_code == 201
    data = response.get_json()
    assert data["status"] == "playing"
    assert "word" not in data
    return data["game_id"]


def make_guess(client, game_id, letter):
    return client.post(f"/api/games/{game_id}/guess", json={"letter": letter})


@pytest.mark.parametrize("difficulty", ["easy", "medium", "hard"])
def test_full_win_then_new_game(client, difficulty):
    game_id = new_game(client, difficulty)
    for letter in "eagl":
        response = make_guess(client, game_id, letter)
        assert response.status_code == 200
        result = response.get_json()
        if result["status"] == "playing":
            assert "word" not in result
    assert result["status"] == "won"
    assert result["word"] == "eagle"
    assert result["remaining_guesses"] == 6
    assert make_guess(client, game_id, "z").status_code == 400

    another_id = new_game(client, difficulty)
    assert another_id != game_id
    assert client.get(f"/api/games/{another_id}").get_json()["guessed_letters"] == []


def test_full_loss_and_state_protection(client):
    game_id = new_game(client)
    for attempt, letter in enumerate("zxywvu", start=1):
        response = make_guess(client, game_id, letter)
        assert response.status_code == 200
        state = response.get_json()
        assert state["remaining_guesses"] == 6 - attempt
        assert state["incorrect_letters"] == list("zxywvu"[:attempt])
        if attempt < 6:
            assert state["status"] == "playing"
            assert "word" not in state
        else:
            assert state["status"] == "lost"
            assert state["word"] == "eagle"
    assert make_guess(client, game_id, "e").status_code == 400


def test_repeated_and_invalid_guesses_leave_state_unchanged(client):
    game_id = new_game(client)
    assert make_guess(client, game_id, "e").status_code == 200
    before = client.get(f"/api/games/{game_id}").get_json()

    for invalid in ("e", "", "12", "aa", None, 17):
        response = make_guess(client, game_id, invalid)
        assert response.status_code == 400
        assert "error" in response.get_json()
        assert client.get(f"/api/games/{game_id}").get_json() == before


def test_unknown_game_and_malformed_json(client):
    unknown = "not-a-real-game"
    assert client.get(f"/api/games/{unknown}").status_code == 404
    assert make_guess(client, unknown, "a").status_code == 404
    response = client.post("/api/games", data="{", content_type="application/json")
    assert response.status_code == 400
    game_id = new_game(client)
    response = client.post(f"/api/games/{game_id}/guess", data="{", content_type="application/json")
    assert response.status_code == 400
    assert client.get(f"/api/games/{game_id}").get_json()["guessed_letters"] == []


def test_browser_and_api_available_on_same_server(client):
    homepage = client.get("/")
    assert homepage.status_code == 200
    assert b"Hangman" in homepage.data
    assert client.get("/static/app.js").status_code == 200
    assert client.get("/static/style.css").status_code == 200
    new_game(client)
