#!/bin/bash

# Check if Docker is installed
if ! command -v docker &> /dev/null
then
    echo "Docker is not installed. Please install Docker to run ZAP security tests."
    exit 1
fi

# Make sure the server is running
echo "Make sure your server is running on http://localhost:5000 before continuing."
read -p "Press enter to continue..."

# Create output directory if it doesn't exist
mkdir -p security-tests/reports

# Run ZAP API scan using Docker
echo "Running ZAP API scan..."
docker run --rm -v $(pwd)/security-tests/reports:/zap/wrk/:rw -t owasp/zap2docker-stable zap-api-scan.py \
    -t http://host.docker.internal:5000/api/ \
    -f openapi \
    -r zap-api-report.html \
    -a

echo "ZAP API scan completed. Report saved to security-tests/reports/zap-api-report.html"
