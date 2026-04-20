# Kids Chores Tracker - Quick Start All Services (PowerShell)

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Kids Chores Tracker - Starting All Services      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "✗ Node.js/npm not found. Install from https://nodejs.org" -ForegroundColor Red
    exit
}

# Check Python
if (!(Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "✗ Python not found. Install from https://python.org" -ForegroundColor Red
    exit
}

Write-Host "✓ Node.js and Python found!" -ForegroundColor Green
Write-Host ""
Write-Host "Starting project services..." -ForegroundColor Yellow
Write-Host ""

Write-Host "[1/3] Opening Backend Terminal (Port 5000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start"
Start-Sleep -Seconds 2

Write-Host "[2/3] Opening Frontend Terminal (Port 3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client; npm start"
Start-Sleep -Seconds 2

Write-Host "[3/3] Opening ML Service Terminal (Port 5001)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ml_service; python app.py"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   ✓ All services are starting!                     ║" -ForegroundColor Green
Write-Host "║   Frontend:  http://localhost:3000                 ║" -ForegroundColor Cyan
Write-Host "║   Backend:   http://localhost:5000                 ║" -ForegroundColor Cyan
Write-Host "║   ML Service: http://localhost:5001                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Wait 10 seconds for services to fully load..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
