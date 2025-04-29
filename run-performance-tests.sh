#!/bin/bash

# Check if k6 is installed
if ! command -v k6 &> /dev/null
then
    echo "k6 is not installed. Please install it from https://k6.io/docs/getting-started/installation/"
    exit 1
fi

# Make sure the server is running
echo "Make sure your server is running on http://localhost:5000 before continuing."
read -p "Press enter to continue..."

# Run the performance test
echo "Running performance tests..."
k6 run performance-tests/api-load-test.js

echo "Performance tests completed."
