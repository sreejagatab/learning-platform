#!/bin/bash

# Run server tests with coverage
echo "Running server tests with coverage..."
cd server
npm test -- --coverage

# Run client tests with coverage
echo "Running client tests with coverage..."
cd ../client
npm test -- --coverage --watchAll=false

# Return to root directory
cd ..
echo "Coverage reports generated."
echo "Server coverage report: server/coverage/lcov-report/index.html"
echo "Client coverage report: client/coverage/lcov-report/index.html"
