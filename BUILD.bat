@echo off
REM AskMyDoc Build Script
REM This script installs dependencies and builds the application

echo ========================================
echo AskMyDoc - Build Script
echo ========================================
echo.

REM Check if npm is installed
echo Checking for npm...
npm --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: npm is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo npm found at:
where npm
echo.

REM Navigate to project directory
cd /d "%~dp0"

REM Install dependencies
echo Installing dependencies...
echo.
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to install dependencies
    echo Try running: npm cache clean --force
    echo Then run this script again
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Dependencies installed successfully!
echo ========================================
echo.

REM Build the project
echo Building application...
echo.
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Build failed
    echo Check the error messages above
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Build completed successfully!
echo ========================================
echo.

REM Show dist size
echo Output files location: %~dp0dist
echo.

REM Optional: Start preview
set /p preview="Start preview server? (y/n): "
if /i "%preview%"=="y" (
    echo Starting preview...
    call npm run preview
) else (
    echo.
    echo To preview the build locally, run:
    echo   npm run preview
    echo.
    pause
)
