#!/bin/bash

# Check if Percy CLI is installed
if ! command -v percy &> /dev/null
then
    echo "Percy CLI is not installed. Installing it now..."
    cd e2e
    npm install @percy/cli @percy/cypress --save-dev
    cd ..
fi

# Make sure the server and client are running
echo "Make sure your server is running on http://localhost:5000 and client on http://localhost:3000 before continuing."
read -p "Press enter to continue..."

# Check if PERCY_TOKEN is set
if [ -z "$PERCY_TOKEN" ]
then
    echo "PERCY_TOKEN is not set. Please set it with:"
    echo "export PERCY_TOKEN=your_percy_token"
    exit 1
fi

# Run the visual regression tests
echo "Running visual regression tests..."
cd e2e
npm run test:visual

echo "Visual regression tests completed."
