@echo off

REM Run the auto-remediation script
echo Running auto-remediation...
node auto-remediate.js

REM Ask if user wants to apply fixes
set /p APPLY_FIXES=Do you want to apply the suggested fixes? (y/n) 
if /i "%APPLY_FIXES%"=="y" (
    REM Apply fixes
    echo Applying fixes...
    call apply-fixes.sh
    
    REM Run tests again to verify fixes
    echo Running tests to verify fixes...
    cd server && npm test
    cd ..\client && npm test
    
    echo Remediation complete. Please check the test results.
) else (
    echo Fixes not applied. You can apply them later by running: bash apply-fixes.sh
)
