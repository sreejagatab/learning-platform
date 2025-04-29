#!/bin/bash

# Install required packages
cd server
npm install @faker-js/faker --save-dev

# Run the test data generation script
echo "Generating test data..."
node scripts/generate-test-data.js

echo "Test data generation completed."
