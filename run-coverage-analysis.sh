#!/bin/bash

# Run the coverage analysis script
echo "Running coverage analysis..."
node analyze-coverage.js

# Open the coverage report
if command -v xdg-open &> /dev/null; then
    xdg-open coverage-analysis.md
elif command -v open &> /dev/null; then
    open coverage-analysis.md
elif command -v start &> /dev/null; then
    start coverage-analysis.md
else
    echo "Coverage analysis complete. Please open coverage-analysis.md and test-suggestions.md to view the results."
fi
