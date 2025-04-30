#!/bin/bash

# Run the auto-remediation script
echo "Running auto-remediation..."
node auto-remediate.js

# Ask if user wants to apply fixes
read -p "Do you want to apply the suggested fixes? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    # Apply fixes
    echo "Applying fixes..."
    bash apply-fixes.sh
    
    # Run tests again to verify fixes
    echo "Running tests to verify fixes..."
    cd server && npm test
    cd ../client && npm test
    
    echo "Remediation complete. Please check the test results."
else
    echo "Fixes not applied. You can apply them later by running: bash apply-fixes.sh"
fi
