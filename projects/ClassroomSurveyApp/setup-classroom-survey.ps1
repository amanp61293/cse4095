# Classroom Survey Web App - Windows PowerShell setup
# Run in the parent folder where you want classroom-survey to be created.
$ErrorActionPreference = 'Stop'
$projectName = 'classroom-survey'

function Require-Success($step) {
    if ($LASTEXITCODE -ne 0) { throw "$step failed with exit code $LASTEXITCODE" }
}

Write-Host 'Checking Windows development tools...' -ForegroundColor Cyan
if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    throw 'winget was not found. Install App Installer from Microsoft Store, then rerun this script.'
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host 'Installing Git...'
    winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements
    Require-Success 'Git installation'
}
if (-not (Get-Command node -ErrorAction SilentlyContinue) -or -not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
    Write-Host 'Installing Node.js LTS (includes npm)...'
    winget install --id OpenJS.NodeJS.LTS -e --source winget --accept-package-agreements --accept-source-agreements
    Require-Success 'Node.js installation'
    Write-Host 'Node.js or Git may require a new terminal for PATH changes. Restart VS Code/PowerShell, then rerun this script.' -ForegroundColor Yellow
    exit 0
}

# Use npm.cmd in PowerShell to avoid npm.ps1 execution policy issues.
Write-Host "Node version: $(node --version)"
Write-Host "npm version: $(npm.cmd --version)"
$nodeMajor = [int]((node --version).TrimStart('v').Split('.')[0])
if ($nodeMajor -lt 22) { throw 'Please upgrade Node.js to a supported current LTS version before continuing.' }

if (Test-Path -LiteralPath $projectName) {
    throw "Folder '$projectName' already exists. To avoid overwriting files, run this script from another parent folder or use a different project name."
}

Write-Host 'Creating React + TypeScript + Vite app...' -ForegroundColor Cyan
npm.cmd create vite@latest $projectName -- --template react-ts --no-interactive
Require-Success 'Vite scaffolding'
Set-Location $projectName
npm.cmd install
Require-Success 'Base dependencies'

Write-Host 'Installing required app packages...' -ForegroundColor Cyan
npm.cmd install react-router-dom @supabase/supabase-js recharts qrcode
Require-Success 'Runtime dependencies'
npm.cmd install -D tailwindcss @tailwindcss/vite @types/qrcode prettier
Require-Success 'Development dependencies'

# Tailwind v4 Vite integration, while retaining the React plugin.
@'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
'@ | Set-Content -LiteralPath 'vite.config.ts' -Encoding UTF8

@'
@import "tailwindcss";
'@ | Set-Content -LiteralPath 'src/index.css' -Encoding UTF8

New-Item -ItemType Directory -Force 'src/components', 'src/pages', 'src/lib', 'supabase' | Out-Null

@'
# Copy this file to .env.local and fill in values after creating a Supabase project.
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
'@ | Set-Content -LiteralPath '.env.example' -Encoding UTF8

@'
{
  "singleQuote": true,
  "semi": false,
  "trailingComma": "all"
}
'@ | Set-Content -LiteralPath '.prettierrc.json' -Encoding UTF8

# Protect local credentials. Vite's scaffold includes .env.local in typical ignore patterns;
# append explicit rules for clarity.
Add-Content -LiteralPath '.gitignore' -Value "`n.env.local`n.env.*.local`n"

Write-Host 'Checking production build...' -ForegroundColor Cyan
npm.cmd run build
Require-Success 'Build'

Write-Host 'Setup completed successfully!' -ForegroundColor Green
Write-Host "Project folder: $(Get-Location)"
Write-Host 'To run: npm.cmd run dev'
Write-Host 'To check lint: npm.cmd run lint'
Write-Host 'To check formatting: npx.cmd prettier --check .'
Write-Host 'Next: Phase 1 can add the basic home page and router from the specifications.'
