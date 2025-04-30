@echo off

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Docker is not installed. Please install Docker to run ZAP security tests.
    exit /b 1
)

REM Make sure the server is running
echo Make sure your server is running on http://localhost:5000 before continuing.
pause

REM Create output directory if it doesn't exist
if not exist security-tests\reports mkdir security-tests\reports

REM Run ZAP API scan using Docker
echo Running ZAP API scan...
docker run --rm -v "%cd%\security-tests\reports:/zap/wrk/:rw" -t owasp/zap2docker-stable zap-api-scan.py ^
    -t http://host.docker.internal:5000/api/ ^
    -f openapi ^
    -r zap-api-report.html ^
    -a

echo ZAP API scan completed. Report saved to security-tests\reports\zap-api-report.html
