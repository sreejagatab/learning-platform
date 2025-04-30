#!/bin/bash

# Run the dashboard update script
echo "Updating test dashboard..."
node monitoring/update-dashboard.js

# Open the dashboard in the browser
if command -v xdg-open &> /dev/null; then
    xdg-open monitoring/test-dashboard.html
elif command -v open &> /dev/null; then
    open monitoring/test-dashboard.html
elif command -v start &> /dev/null; then
    start monitoring/test-dashboard.html
else
    echo "Dashboard updated. Please open monitoring/test-dashboard.html in your browser."
fi
