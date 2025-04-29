@echo off
echo Running server tests with coverage...
cd server
call npm test -- --coverage

echo Running client tests with coverage...
cd ../client
call npm test -- --coverage --watchAll=false

cd ..
echo Coverage reports generated.
echo Server coverage report: server\coverage\lcov-report\index.html
echo Client coverage report: client\coverage\lcov-report\index.html
