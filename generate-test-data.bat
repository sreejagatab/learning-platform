@echo off

REM Install required packages
cd server
call npm install @faker-js/faker --save-dev

REM Run the test data generation script
echo Generating test data...
node scripts/generate-test-data.js

echo Test data generation completed.
