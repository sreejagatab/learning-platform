@echo off

REM Check if axe-core and cypress-axe are installed
cd e2e
call npm list axe-core >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo axe-core is not installed. Installing it now...
    call npm install axe-core cypress-axe --save-dev
)
cd ..

REM Make sure the server and client are running
echo Make sure your server is running on http://localhost:5000 and client on http://localhost:3000 before continuing.
pause

REM Run the accessibility tests
echo Running accessibility tests...
cd e2e
call npm run test:a11y

echo Accessibility tests completed.
