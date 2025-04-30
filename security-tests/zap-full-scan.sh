#!/bin/bash

# Check if Docker is installed
if ! command -v docker &> /dev/null
then
    echo "Docker is not installed. Please install Docker to run ZAP security tests."
    exit 1
fi

# Make sure the server and client are running
echo "Make sure your server is running on http://localhost:5000 and client on http://localhost:3000 before continuing."
read -p "Press enter to continue..."

# Create output directory if it doesn't exist
mkdir -p security-tests/reports

# Run ZAP full scan using Docker
echo "Running ZAP full scan..."
docker run --rm -v $(pwd)/security-tests/reports:/zap/wrk/:rw -t owasp/zap2docker-stable zap-full-scan.py \
    -t http://host.docker.internal:3000/ \
    -r zap-full-report.html \
    -a

echo "ZAP full scan completed. Report saved to security-tests/reports/zap-full-report.html"
