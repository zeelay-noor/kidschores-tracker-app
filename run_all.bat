@echo off
REM Kids Chores Tracker - Quick Start All Services

echo.
echo ╔════════════════════════════════════════════════════╗
echo ║   Kids Chores Tracker - Starting All Services      ║
echo ╚════════════════════════════════════════════════════╝
echo.

echo ✓ Checking if npm and python are installed...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Node.js/npm not found. Please install from https://nodejs.org
    pause
    exit /b
)

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Python not found. Please install from https://python.org
    pause
    exit /b
)

echo ✓ Node.js and Python found!
echo.
echo Starting project services...
echo.

echo [1/3] Opening Backend Terminal (Port 5000)...
start cmd /k "npm start"
timeout /t 2 /nobreak

echo [2/3] Opening Frontend Terminal (Port 3000)...
start cmd /k "cd client && npm start"
timeout /t 2 /nobreak

echo [3/3] Opening ML Service Terminal (Port 5001)...
start cmd /k "cd ml_service && python app.py"

echo.
echo ╔════════════════════════════════════════════════════╗
echo ║   ✓ All services are starting!                     ║
echo ║   Frontend:  http://localhost:3000                 ║
echo ║   Backend:   http://localhost:5000                 ║
echo ║   ML Service: http://localhost:5001                ║
echo ╚════════════════════════════════════════════════════╝
echo.
echo Wait 10 seconds for services to fully load...
timeout /t 10
