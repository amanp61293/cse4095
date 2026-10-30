"""Basic checks for the browser page and served assets."""
from server import app


def test_homepage_is_served():
    client = app.test_client()
    response = client.get("/")
    assert response.status_code == 200
    html = response.get_data(as_text=True)
    assert "Hangman" in html
    assert 'id="new-game"' in html
    assert 'id="keyboard"' in html
    assert 'id="difficulty"' in html


def test_browser_assets_are_served():
    client = app.test_client()
    for filename in ("app.js", "style.css"):
        response = client.get(f"/static/{filename}")
        assert response.status_code == 200
        assert response.data


def test_browser_script_uses_api():
    client = app.test_client()
    script = client.get("/static/app.js").get_data(as_text=True)
    assert '"/api/games"' in script
    assert "fetch(url, options)" in script
