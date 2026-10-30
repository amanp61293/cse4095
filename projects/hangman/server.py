"""Flask REST API for the server-controlled Hangman game."""

from uuid import uuid4

from flask import Flask, jsonify, request, send_from_directory

from game import GameOverError, HangmanGame, InvalidGuessError
from word_manager import choose_word

app = Flask(__name__)
games = {}  # Game ID -> HangmanGame. Games reset when the server restarts.


def error_response(message, status_code):
    """Return a consistent JSON error with an HTTP status code."""
    return jsonify({"error": message}), status_code


def read_json_object():
    """Read a JSON object, or return None for invalid/missing JSON."""
    if not request.is_json:
        return None
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return None
    return data


@app.get("/")
def home():
    """Serve the browser client."""
    return send_from_directory("static", "index.html")


@app.post("/api/games")
def create_game():
    data = read_json_object()
    if data is None:
        return error_response("Send a JSON object.", 400)

    difficulty = data.get("difficulty")
    if not isinstance(difficulty, str) or difficulty.lower() not in ("easy", "medium", "hard"):
        return error_response("Difficulty must be easy, medium, or hard.", 400)

    word = choose_word(difficulty.lower())
    game_id = uuid4().hex
    games[game_id] = HangmanGame(word)
    return jsonify({"game_id": game_id, **games[game_id].to_state()}), 201


@app.get("/api/games/<game_id>")
def get_game(game_id):
    game = games.get(game_id)
    if game is None:
        return error_response("Game not found.", 404)
    return jsonify({"game_id": game_id, **game.to_state()})


@app.post("/api/games/<game_id>/guess")
def submit_guess(game_id):
    game = games.get(game_id)
    if game is None:
        return error_response("Game not found.", 404)

    data = read_json_object()
    if data is None:
        return error_response("Send a JSON object.", 400)
    if "letter" not in data:
        return error_response("Provide a letter.", 400)

    try:
        state = game.guess(data["letter"])
    except (InvalidGuessError, GameOverError) as exc:
        return error_response(str(exc), 400)

    return jsonify({"game_id": game_id, **state})


if __name__ == "__main__":
    app.run(debug=True)
