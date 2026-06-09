# CarbonWise Startup Script
# This script initializes the Python virtual environment, installs dependencies, and runs both servers.

Write-Host "===============================================" -ForegroundColor Green
Write-Host "    CarbonWise: Starting Application Setup     " -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# 1. Setup Backend
Write-Host "`n[1/4] Checking Python Backend..." -ForegroundColor Cyan
if (-not (Test-Path "backend/venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv backend/venv
}

Write-Host "Activating virtual environment & installing backend packages..." -ForegroundColor Yellow
& "backend/venv/Scripts/pip" install -r backend/requirements.txt

# 2. Setup Frontend
Write-Host "`n[2/4] Checking React Frontend..." -ForegroundColor Cyan
if (-not (Test-Path "frontend/node_modules")) {
    Write-Host "Installing NPM packages for frontend..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
}

# 3. Launch Backend in a New Window
Write-Host "`n[3/4] Launching FastAPI Backend on http://localhost:8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Starting CarbonWise FastAPI Backend...' -ForegroundColor Cyan; & 'backend/venv/Scripts/uvicorn' backend.app.main:app --reload"

# 4. Launch Frontend in a New Window
Write-Host "`n[4/4] Launching Vite Frontend on http://localhost:5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Starting CarbonWise React Frontend...' -ForegroundColor Cyan; Set-Location frontend; npm run dev"

Write-Host "`nSetup Complete!" -ForegroundColor Green
Write-Host "1. Backend running at: http://localhost:8000" -ForegroundColor Green
Write-Host "2. Frontend running at: http://localhost:5173" -ForegroundColor Green
Write-Host "3. Double check your browser! Enjoy your project." -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
