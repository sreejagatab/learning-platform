#!/bin/bash

# Auto-generated remediation script

set -e

echo "Updating axios in server..."
cd server && npm update axios --save
echo "Fixing missing alt text for img[src="/images/profile.jpg"]..."
find client/src -type f -name "*.js" -o -name "*.jsx" -o -name "*.html" | xargs grep -l "/images/profile.jpg" | xargs sed -i 's|/images/profile.jpg"|/images/profile.jpg" alt="profile"|g'
echo "Fixing missing alt text for img[src="/images/logo.png"]..."
find client/src -type f -name "*.js" -o -name "*.jsx" -o -name "*.html" | xargs grep -l "/images/logo.png" | xargs sed -i 's|/images/logo.png"|/images/logo.png" alt="logo"|g'
echo "Fixing missing label for input[name="search"]..."
find client/src -type f -name "*.js" -o -name "*.jsx" -o -name "*.html" | xargs grep -l "<input type="text" name="search">" | xargs sed -i 's|<input type="text" name="search">|<label for="search">Search</label>\n<input type="text" name="search">|g'

echo "Remediation complete. Please review changes and run tests again."
