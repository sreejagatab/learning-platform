@echo off

REM Create reports directory if it doesn't exist
if not exist security-tests\reports mkdir security-tests\reports

REM Run dependency check
echo Running dependency vulnerability check...
call run-dependency-check.bat

REM Check if Docker is installed for ZAP scans
where docker >nul 2>nul
if %ERRORLEVEL% equ 0 (
    REM Make sure the server and client are running
    echo Make sure your server is running on http://localhost:5000 and client on http://localhost:3000 before continuing.
    pause
    
    REM Run ZAP API scan
    echo Running ZAP API scan...
    call security-tests\zap-api-scan.bat
    
    REM Run ZAP full scan
    echo Running ZAP full scan...
    call security-tests\zap-full-scan.bat
) else (
    echo Docker is not installed. Skipping ZAP security scans.
)

echo Security tests completed. Reports saved to security-tests\reports\
