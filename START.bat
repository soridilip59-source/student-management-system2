@echo off
REM Student Management System - Quick Start Script for Windows

cls
echo.
echo ============================================================
echo.
echo   [90m Student Management System - Quick Start[0m
echo.
echo ============================================================
echo.
echo Status: [92mCOMPLETE AND PRODUCTION READY[0m
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [93m npm not found. Please install Node.js from: https://nodejs.org/[0m
    echo.
    pause
    exit /b 1
)

echo [92m✓ Node.js and npm found[0m
echo.

REM Backend setup
echo ============================================================
echo STEP 1: Installing Backend Dependencies
echo ============================================================
echo.

cd backend
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo [91mError installing backend dependencies[0m
    pause
    exit /b 1
)

echo.
echo [92m✓ Backend dependencies installed[0m
echo.

REM Frontend setup
cd ..
cd frontend

echo ============================================================
echo STEP 2: Installing Frontend Dependencies
echo ============================================================
echo.

call npm install

if %ERRORLEVEL% NEQ 0 (
    echo [91mError installing frontend dependencies[0m
    pause
    exit /b 1
)

echo.
echo [92m✓ Frontend dependencies installed[0m
echo.

cd ..

echo ============================================================
echo [92m SETUP COMPLETE[0m
echo ============================================================
echo.
echo Next Steps:
echo.
echo 1. Open Command Prompt/PowerShell Window 1 and run:
echo    [93mcd backend[0m
echo    [93mnpm run dev[0m
echo.
echo 2. Open Command Prompt/PowerShell Window 2 and run:
echo    [93mcd frontend[0m
echo    [93mnpm run dev[0m
echo.
echo 3. Open browser: [93mhttp://localhost:5173[0m
echo.
echo 4. Login with:
echo    Email: [92madmin@sms.com[0m
echo    Password: [92madmin123[0m
echo.
echo ============================================================
echo DOCUMENTATION
echo ============================================================
echo.
echo - README.md              Full documentation
echo - QUICKSTART.md          5-minute setup guide
echo - API_TESTING.md         Test all endpoints
echo - DEPLOYMENT.md          Production deployment
echo - DOCUMENTATION_INDEX.md Browse all documentation
echo.
echo ============================================================
echo OTHER DEMO ACCOUNTS
echo ============================================================
echo.
echo Teacher: [92mteacher@sms.com[0m / [92mteacher123[0m
echo Student: [92mstudent@sms.com[0m / [92mstudent123[0m
echo.
echo ============================================================
echo.
echo [92mHappy coding![0m
echo.

pause
