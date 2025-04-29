@echo off
echo Running server tests...
cd server
call npm test

echo Running client tests...
cd ../client
call npm test -- --watchAll=false

cd ..
echo All tests completed.
