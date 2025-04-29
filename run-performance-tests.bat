@echo off

REM Check if k6 is installed
where k6 >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo k6 is not installed. Please install it from https://k6.io/docs/getting-started/installation/
    exit /b 1
)

REM Make sure the server is running
echo Make sure your server is running on http://localhost:5000 before continuing.
pause

REM Run the performance test
echo Running performance tests...
k6 run performance-tests/api-load-test.js

echo Performance tests completed.
