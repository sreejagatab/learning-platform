#!/bin/bash

# Check if Cypress is installed
if ! command -v cypress &> /dev/null
then
    echo "Cypress is not installed. Installing it now..."
    cd e2e
    npm install cypress --save-dev
    cd ..
fi

# Make sure the server and client are running
echo "Make sure your server is running on http://localhost:5000 and client on http://localhost:3000 before continuing."
read -p "Press enter to continue..."

# Run the end-to-end tests
echo "Running end-to-end tests..."
cd e2e
npx cypress run

echo "End-to-end tests completed."
