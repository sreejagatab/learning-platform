@echo off

REM Run the dashboard update script
echo Updating test dashboard...
node monitoring/update-dashboard.js

REM Open the dashboard in the browser
start monitoring/test-dashboard.html
