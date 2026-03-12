# AskMyDoc Build Script for PowerShell
# This script installs dependencies and builds the application

Write-Host "========================================"
Write-Host "AskMyDoc - Build Script (PowerShell)" -ForegroundColor Cyan
Write-Host "========================================"
Write-Host ""

# Check if npm is installed
Write-Host "Checking for npm..." -ForegroundColor Yellow
$npmCheck = npm --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: npm is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "npm version: $npmCheck" -ForegroundColor Green
Write-Host ""

# Navigate to script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath
Write-Host "Working directory: $(Get-Location)" -ForegroundColor Gray
Write-Host ""

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
Write-Host ""
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
    Write-Host "Try running: npm cache clean --force" -ForegroundColor Yellow
    Write-Host "Then run this script again" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "========================================"
Write-Host "Dependencies installed successfully!" -ForegroundColor Green
Write-Host "========================================"
Write-Host ""

# Build the project
Write-Host "Building application..." -ForegroundColor Yellow
Write-Host ""
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Build failed" -ForegroundColor Red
    Write-Host "Check the error messages above" -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "========================================"
Write-Host "Build completed successfully!" -ForegroundColor Green
Write-Host "========================================"
Write-Host ""

$distPath = Join-Path $scriptPath "dist"
Write-Host "Output files location: $distPath" -ForegroundColor Cyan
Write-Host ""

# Show file sizes if dist exists
if (Test-Path $distPath) {
    Write-Host "Output files:" -ForegroundColor Cyan
    Get-ChildItem $distPath -Recurse -File | ForEach-Object {
        $sizeKB = [math]::Round($_.Length / 1KB, 2)
        Write-Host "  $($_.FullName -replace [regex]::Escape($distPath), '.'): $sizeKB KB" -ForegroundColor Gray
    }
    Write-Host ""
}

# Optional: Start preview
$preview = Read-Host "Start preview server? (y/n)"
if ($preview -eq 'y' -or $preview -eq 'Y') {
    Write-Host "Starting preview..." -ForegroundColor Yellow
    npm run preview
} else {
    Write-Host ""
    Write-Host "To preview the build locally, run:" -ForegroundColor Yellow
    Write-Host "  npm run preview" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Press Enter to exit"
}
