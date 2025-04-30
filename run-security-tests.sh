#!/bin/bash

# Create reports directory if it doesn't exist
mkdir -p security-tests/reports

# Run dependency check
echo "Running dependency vulnerability check..."
./run-dependency-check.sh

# Check if Docker is installed for ZAP scans
if command -v docker &> /dev/null
then
    # Make sure the server and client are running
    echo "Make sure your server is running on http://localhost:5000 and client on http://localhost:3000 before continuing."
    read -p "Press enter to continue..."
    
    # Run ZAP API scan
    echo "Running ZAP API scan..."
    ./security-tests/zap-api-scan.sh
    
    # Run ZAP full scan
    echo "Running ZAP full scan..."
    ./security-tests/zap-full-scan.sh
else
    echo "Docker is not installed. Skipping ZAP security scans."
fi

echo "Security tests completed. Reports saved to security-tests/reports/"
