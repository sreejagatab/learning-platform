@echo off

REM Check if Percy CLI is installed
cd e2e
if not exist node_modules\@percy\cli (
    echo Percy CLI is not installed. Installing it now...
    npm install @percy/cli @percy/cypress --save-dev
)
cd ..

REM Make sure the server and client are running
echo Make sure your server is running on http://localhost:5000 and client on http://localhost:3000 before continuing.
pause

REM Check if PERCY_TOKEN is set
if "%PERCY_TOKEN%"=="" (
    echo PERCY_TOKEN is not set. Please set it with:
    echo set PERCY_TOKEN=your_percy_token
    exit /b 1
)

REM Run the visual regression tests
echo Running visual regression tests...
cd e2e
npm run test:visual

echo Visual regression tests completed.
