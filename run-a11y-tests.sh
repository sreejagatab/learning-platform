#!/bin/bash

# Check if axe-core and cypress-axe are installed
cd e2e
if ! npm list axe-core &> /dev/null || ! npm list cypress-axe &> /dev/null
then
    echo "axe-core or cypress-axe is not installed. Installing them now..."
    npm install axe-core cypress-axe --save-dev
fi
cd ..

# Make sure the server and client are running
echo "Make sure your server is running on http://localhost:5000 and client on http://localhost:3000 before continuing."
read -p "Press enter to continue..."

# Run the accessibility tests
echo "Running accessibility tests..."
cd e2e
npm run test:a11y

echo "Accessibility tests completed."
