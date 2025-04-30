@echo off

REM Create reports directory if it doesn't exist
if not exist security-tests\reports mkdir security-tests\reports

REM Run the dependency check script
echo Running dependency vulnerability check...
node security-tests\dependency-check.js

REM Check the exit code
if %ERRORLEVEL% equ 0 (
  echo Dependency check completed successfully.
) else (
  echo Dependency check found critical or high severity vulnerabilities.
  echo Please review the reports in security-tests\reports\
)
