#!/bin/bash

# Training Session Script for Learning Platform Testing

echo "=== Learning Platform Testing Training Session ==="
echo ""
echo "This script will guide you through a hands-on training session on testing the Learning Platform."
echo "You'll learn how to run different types of tests, interpret results, and write your own tests."
echo ""
read -p "Press Enter to begin the training session..."

# Step 1: Introduction to Testing
echo ""
echo "=== Step 1: Introduction to Testing ==="
echo ""
echo "Let's start by opening the testing guide to get an overview of our testing approach."
echo ""

if command -v xdg-open &> /dev/null; then
    xdg-open docs/testing-guide.md
elif command -v open &> /dev/null; then
    open docs/testing-guide.md
elif command -v start &> /dev/null; then
    start docs/testing-guide.md
else
    echo "Please open docs/testing-guide.md in your browser."
fi

echo "Take a few minutes to read through the introduction and testing philosophy sections."
echo ""
read -p "Press Enter when you're ready to continue..."

# Step 2: Running Basic Tests
echo ""
echo "=== Step 2: Running Basic Tests ==="
echo ""
echo "Now, let's run some basic tests to see how they work."
echo ""
echo "First, let's run the server tests:"
echo ""
echo "$ cd server && npm test"
echo ""
echo "This will run all the server-side tests using Jest."
echo ""
read -p "Press Enter to run the server tests..."

cd server && npm test
cd ..

echo ""
echo "Now, let's run the client tests:"
echo ""
echo "$ cd client && npm test -- --watchAll=false"
echo ""
echo "This will run all the client-side tests using Jest."
echo ""
read -p "Press Enter to run the client tests..."

cd client && npm test -- --watchAll=false
cd ..

# Step 3: Understanding Test Results
echo ""
echo "=== Step 3: Understanding Test Results ==="
echo ""
echo "Let's analyze the test results you just saw."
echo ""
echo "In Jest test output:"
echo "- PASS means all tests in that file passed"
echo "- FAIL means at least one test in that file failed"
echo "- The summary shows the number of test suites and tests that passed or failed"
echo ""
echo "For failed tests, Jest shows:"
echo "- The test name that failed"
echo "- The expected vs. received values"
echo "- The location of the failure"
echo ""
read -p "Press Enter to continue..."

# Step 4: Running Advanced Tests
echo ""
echo "=== Step 4: Running Advanced Tests ==="
echo ""
echo "Now, let's look at some of the advanced testing capabilities."
echo ""
echo "Let's run the test coverage analysis:"
echo ""
echo "$ node analyze-coverage.js"
echo ""
echo "This will analyze the test coverage and suggest areas for improvement."
echo ""
read -p "Press Enter to run the coverage analysis..."

node analyze-coverage.js

echo ""
echo "Let's open the coverage analysis report:"
echo ""

if command -v xdg-open &> /dev/null; then
    xdg-open coverage-analysis.md
elif command -v open &> /dev/null; then
    open coverage-analysis.md
elif command -v start &> /dev/null; then
    start coverage-analysis.md
else
    echo "Please open coverage-analysis.md in your browser."
fi

echo "Take a few minutes to review the coverage report."
echo ""
read -p "Press Enter when you're ready to continue..."

# Step 5: Writing Tests
echo ""
echo "=== Step 5: Writing Tests ==="
echo ""
echo "Now, let's practice writing a simple test."
echo ""
echo "We'll create a test for a utility function."
echo ""

# Create a simple utility function to test
mkdir -p server/utils
cat > server/utils/formatter.js << 'EOF'
/**
 * Utility functions for formatting data
 */

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: USD)
 * @returns {string} The formatted currency string
 */
function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Format a date
 * @param {Date|string} date - The date to format
 * @param {string} format - The format to use (default: 'short')
 * @returns {string} The formatted date string
 */
function formatDate(date, format = 'short') {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString();
    case 'long':
      return dateObj.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    case 'time':
      return dateObj.toLocaleTimeString();
    case 'datetime':
      return dateObj.toLocaleString();
    default:
      return dateObj.toLocaleDateString();
  }
}

module.exports = {
  formatCurrency,
  formatDate
};
EOF

echo "We've created a simple formatter utility with two functions:"
echo "- formatCurrency: Formats a number as currency"
echo "- formatDate: Formats a date in different formats"
echo ""
echo "Now, let's create a test file for this utility:"
echo ""

# Create a test file
mkdir -p server/tests/utils
cat > server/tests/utils/formatter.test.js << 'EOF'
const { formatCurrency, formatDate } = require('../../utils/formatter');

describe('Formatter Utilities', () => {
  describe('formatCurrency', () => {
    test('should format number as USD currency by default', () => {
      const result = formatCurrency(1234.56);
      expect(result).toBe('$1,234.56');
    });
    
    test('should format number with specified currency', () => {
      const result = formatCurrency(1234.56, 'EUR');
      expect(result).toBe('€1,234.56');
    });
    
    test('should handle zero', () => {
      const result = formatCurrency(0);
      expect(result).toBe('$0.00');
    });
    
    test('should handle negative numbers', () => {
      const result = formatCurrency(-1234.56);
      expect(result).toBe('-$1,234.56');
    });
  });
  
  describe('formatDate', () => {
    // Create a fixed date for testing
    const testDate = new Date('2023-01-15T12:30:45');
    
    test('should format date with short format by default', () => {
      const result = formatDate(testDate);
      // This will vary by locale, so we'll just check it's a string
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
    
    test('should format date with long format', () => {
      const result = formatDate(testDate, 'long');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      // Should include the month name
      expect(result).toContain('January');
    });
    
    test('should format date with time format', () => {
      const result = formatDate(testDate, 'time');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
    
    test('should format date with datetime format', () => {
      const result = formatDate(testDate, 'datetime');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
    
    test('should handle string date input', () => {
      const result = formatDate('2023-01-15');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
EOF

echo "We've created a test file with several test cases for each function."
echo "Let's run these tests to see if they pass:"
echo ""
echo "$ cd server && npx jest tests/utils/formatter.test.js"
echo ""
read -p "Press Enter to run the tests..."

cd server && npx jest tests/utils/formatter.test.js
cd ..

echo ""
echo "Great! Now let's look at the test file and understand its structure:"
echo ""
echo "1. We use 'describe' blocks to group related tests"
echo "2. We use 'test' blocks to define individual test cases"
echo "3. We use 'expect' with matchers like 'toBe' to assert expected outcomes"
echo ""
echo "This follows the Arrange-Act-Assert pattern:"
echo "- Arrange: Set up the test data"
echo "- Act: Call the function being tested"
echo "- Assert: Verify the result matches expectations"
echo ""
read -p "Press Enter to continue..."

# Step 6: Test Dashboard
echo ""
echo "=== Step 6: Test Dashboard ==="
echo ""
echo "Let's look at the test dashboard to see how we monitor test results over time."
echo ""
echo "$ node monitoring/update-dashboard.js"
echo ""
read -p "Press Enter to update and open the dashboard..."

node monitoring/update-dashboard.js

if command -v xdg-open &> /dev/null; then
    xdg-open monitoring/test-dashboard.html
elif command -v open &> /dev/null; then
    open monitoring/test-dashboard.html
elif command -v start &> /dev/null; then
    start monitoring/test-dashboard.html
else
    echo "Please open monitoring/test-dashboard.html in your browser."
fi

echo ""
echo "The dashboard shows:"
echo "- Test results trends"
echo "- Code coverage"
echo "- Security vulnerabilities"
echo "- Accessibility issues"
echo "- Performance metrics"
echo "- Visual regression changes"
echo ""
echo "We update this dashboard regularly to monitor the health of our tests."
echo ""
read -p "Press Enter to continue..."

# Step 7: Testing Cheatsheet
echo ""
echo "=== Step 7: Testing Cheatsheet ==="
echo ""
echo "Finally, let's look at the testing cheatsheet for quick reference."
echo ""

if command -v xdg-open &> /dev/null; then
    xdg-open docs/testing-cheatsheet.md
elif command -v open &> /dev/null; then
    open docs/testing-cheatsheet.md
elif command -v start &> /dev/null; then
    start docs/testing-cheatsheet.md
else
    echo "Please open docs/testing-cheatsheet.md in your browser."
fi

echo "This cheatsheet provides quick reference for common testing tasks."
echo "Keep it handy when you're writing or running tests."
echo ""
read -p "Press Enter to continue..."

# Conclusion
echo ""
echo "=== Training Session Complete ==="
echo ""
echo "Congratulations! You've completed the training session on testing the Learning Platform."
echo ""
echo "You've learned how to:"
echo "- Run different types of tests"
echo "- Interpret test results"
echo "- Write your own tests"
echo "- Use the test dashboard"
echo "- Find testing resources"
echo ""
echo "Remember, good tests lead to better code quality, fewer bugs, and a better user experience."
echo ""
echo "If you have any questions, refer to the testing guide or ask for help in the #testing Slack channel."
echo ""
echo "Happy testing!"
echo ""
