#!/bin/bash

# Run server tests
echo "Running server tests..."
cd server
npm test

# Run client tests
echo "Running client tests..."
cd ../client
npm test -- --watchAll=false

# Return to root directory
cd ..
echo "All tests completed."
