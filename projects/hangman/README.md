# Hangman Web Game

CSE 4095 project: Python/Flask Hangman server and HTML/CSS/JavaScript browser client.

## Status
Phase 1 starter structure only. The game has not been implemented yet.

## Local setup (Windows PowerShell)
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m pip show Flask pytest gunicorn
```

If PowerShell prevents activation, run `.venv\Scripts\python.exe -m pip install -r requirements.txt` instead.

## Git setup
```powershell
git init
git add .
git commit -m "Phase 1: initialize Hangman project"
```

Create an empty GitHub repository, then follow its instructions to add the remote and push.

## Next step
Complete the Phase 1 local environment and GitHub checklist, then implement Phase 2 (the game engine). The assignment scope excludes bots, terminal clients, evaluation, and leaderboards.
