@echo off

REM Check if Cypress is installed
cd e2e
if not exist node_modules\cypress (
    echo Cypress is not installed. Installing it now...
    npm install cypress --save-dev
)
cd ..

REM Make sure the server and client are running
echo Make sure your server is running on http://localhost:5000 and client on http://localhost:3000 before continuing.
pause

REM Run the end-to-end tests
echo Running end-to-end tests...
cd e2e
npx cypress run

echo End-to-end tests completed.
