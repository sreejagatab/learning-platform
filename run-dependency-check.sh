#!/bin/bash

# Create reports directory if it doesn't exist
mkdir -p security-tests/reports

# Run the dependency check script
echo "Running dependency vulnerability check..."
node security-tests/dependency-check.js

# Check the exit code
if [ $? -eq 0 ]; then
  echo "Dependency check completed successfully."
else
  echo "Dependency check found critical or high severity vulnerabilities."
  echo "Please review the reports in security-tests/reports/"
fi
