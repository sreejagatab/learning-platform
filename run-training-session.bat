@echo off

REM Training Session Script for Learning Platform Testing

echo === Learning Platform Testing Training Session ===
echo.
echo This script will guide you through a hands-on training session on testing the Learning Platform.
echo You'll learn how to run different types of tests, interpret results, and write your own tests.
echo.
pause

REM Step 1: Introduction to Testing
echo.
echo === Step 1: Introduction to Testing ===
echo.
echo Let's start by opening the testing guide to get an overview of our testing approach.
echo.

start docs\testing-guide.md

echo Take a few minutes to read through the introduction and testing philosophy sections.
echo.
pause

REM Step 2: Running Basic Tests
echo.
echo === Step 2: Running Basic Tests ===
echo.
echo Now, let's run some basic tests to see how they work.
echo.
echo First, let's run the server tests:
echo.
echo $ cd server ^&^& npm test
echo.
echo This will run all the server-side tests using Jest.
echo.
pause

cd server && npm test
cd ..

echo.
echo Now, let's run the client tests:
echo.
echo $ cd client ^&^& npm test -- --watchAll=false
echo.
echo This will run all the client-side tests using Jest.
echo.
pause

cd client && npm test -- --watchAll=false
cd ..

REM Step 3: Understanding Test Results
echo.
echo === Step 3: Understanding Test Results ===
echo.
echo Let's analyze the test results you just saw.
echo.
echo In Jest test output:
echo - PASS means all tests in that file passed
echo - FAIL means at least one test in that file failed
echo - The summary shows the number of test suites and tests that passed or failed
echo.
echo For failed tests, Jest shows:
echo - The test name that failed
echo - The expected vs. received values
echo - The location of the failure
echo.
pause

REM Step 4: Running Advanced Tests
echo.
echo === Step 4: Running Advanced Tests ===
echo.
echo Now, let's look at some of the advanced testing capabilities.
echo.
echo Let's run the test coverage analysis:
echo.
echo $ node analyze-coverage.js
echo.
echo This will analyze the test coverage and suggest areas for improvement.
echo.
pause

node analyze-coverage.js

echo.
echo Let's open the coverage analysis report:
echo.

start coverage-analysis.md

echo Take a few minutes to review the coverage report.
echo.
pause

REM Step 5: Writing Tests
echo.
echo === Step 5: Writing Tests ===
echo.
echo Now, let's practice writing a simple test.
echo.
echo We'll create a test for a utility function.
echo.

REM Create a simple utility function to test
if not exist server\utils mkdir server\utils
echo /**
echo  * Utility functions for formatting data
echo  */
echo.
echo /**
echo  * Format a number as currency
echo  * @param {number} amount - The amount to format
echo  * @param {string} currency - The currency code (default: USD)
echo  * @returns {string} The formatted currency string
echo  */
echo function formatCurrency(amount, currency = 'USD') {
echo   return new Intl.NumberFormat('en-US', {
echo     style: 'currency',
echo     currency: currency
echo   }).format(amount);
echo }
echo.
echo /**
echo  * Format a date
echo  * @param {Date^|string} date - The date to format
echo  * @param {string} format - The format to use (default: 'short')
echo  * @returns {string} The formatted date string
echo  */
echo function formatDate(date, format = 'short') {
echo   const dateObj = typeof date === 'string' ? new Date(date) : date;
echo   
echo   switch (format) {
echo     case 'short':
echo       return dateObj.toLocaleDateString();
echo     case 'long':
echo       return dateObj.toLocaleDateString(undefined, {
echo         weekday: 'long',
echo         year: 'numeric',
echo         month: 'long',
echo         day: 'numeric'
echo       });
echo     case 'time':
echo       return dateObj.toLocaleTimeString();
echo     case 'datetime':
echo       return dateObj.toLocaleString();
echo     default:
echo       return dateObj.toLocaleDateString();
echo   }
echo }
echo.
echo module.exports = {
echo   formatCurrency,
echo   formatDate
echo };> server\utils\formatter.js

echo We've created a simple formatter utility with two functions:
echo - formatCurrency: Formats a number as currency
echo - formatDate: Formats a date in different formats
echo.
echo Now, let's create a test file for this utility:
echo.

REM Create a test file
if not exist server\tests\utils mkdir server\tests\utils
echo const { formatCurrency, formatDate } = require('../../utils/formatter');
echo.
echo describe('Formatter Utilities', () => {
echo   describe('formatCurrency', () => {
echo     test('should format number as USD currency by default', () => {
echo       const result = formatCurrency(1234.56);
echo       expect(result).toBe('$1,234.56');
echo     });
echo     
echo     test('should format number with specified currency', () => {
echo       const result = formatCurrency(1234.56, 'EUR');
echo       expect(result).toBe('€1,234.56');
echo     });
echo     
echo     test('should handle zero', () => {
echo       const result = formatCurrency(0);
echo       expect(result).toBe('$0.00');
echo     });
echo     
echo     test('should handle negative numbers', () => {
echo       const result = formatCurrency(-1234.56);
echo       expect(result).toBe('-$1,234.56');
echo     });
echo   });
echo   
echo   describe('formatDate', () => {
echo     // Create a fixed date for testing
echo     const testDate = new Date('2023-01-15T12:30:45');
echo     
echo     test('should format date with short format by default', () => {
echo       const result = formatDate(testDate);
echo       // This will vary by locale, so we'll just check it's a string
echo       expect(typeof result).toBe('string');
echo       expect(result.length).toBeGreaterThan(0);
echo     });
echo     
echo     test('should format date with long format', () => {
echo       const result = formatDate(testDate, 'long');
echo       expect(typeof result).toBe('string');
echo       expect(result.length).toBeGreaterThan(0);
echo       // Should include the month name
echo       expect(result).toContain('January');
echo     });
echo     
echo     test('should format date with time format', () => {
echo       const result = formatDate(testDate, 'time');
echo       expect(typeof result).toBe('string');
echo       expect(result.length).toBeGreaterThan(0);
echo     });
echo     
echo     test('should format date with datetime format', () => {
echo       const result = formatDate(testDate, 'datetime');
echo       expect(typeof result).toBe('string');
echo       expect(result.length).toBeGreaterThan(0);
echo     });
echo     
echo     test('should handle string date input', () => {
echo       const result = formatDate('2023-01-15');
echo       expect(typeof result).toBe('string');
echo       expect(result.length).toBeGreaterThan(0);
echo     });
echo   });
echo });> server\tests\utils\formatter.test.js

echo We've created a test file with several test cases for each function.
echo Let's run these tests to see if they pass:
echo.
echo $ cd server ^&^& npx jest tests/utils/formatter.test.js
echo.
pause

cd server && npx jest tests/utils/formatter.test.js
cd ..

echo.
echo Great! Now let's look at the test file and understand its structure:
echo.
echo 1. We use 'describe' blocks to group related tests
echo 2. We use 'test' blocks to define individual test cases
echo 3. We use 'expect' with matchers like 'toBe' to assert expected outcomes
echo.
echo This follows the Arrange-Act-Assert pattern:
echo - Arrange: Set up the test data
echo - Act: Call the function being tested
echo - Assert: Verify the result matches expectations
echo.
pause

REM Step 6: Test Dashboard
echo.
echo === Step 6: Test Dashboard ===
echo.
echo Let's look at the test dashboard to see how we monitor test results over time.
echo.
echo $ node monitoring/update-dashboard.js
echo.
pause

node monitoring/update-dashboard.js
start monitoring\test-dashboard.html

echo.
echo The dashboard shows:
echo - Test results trends
echo - Code coverage
echo - Security vulnerabilities
echo - Accessibility issues
echo - Performance metrics
echo - Visual regression changes
echo.
echo We update this dashboard regularly to monitor the health of our tests.
echo.
pause

REM Step 7: Testing Cheatsheet
echo.
echo === Step 7: Testing Cheatsheet ===
echo.
echo Finally, let's look at the testing cheatsheet for quick reference.
echo.

start docs\testing-cheatsheet.md

echo This cheatsheet provides quick reference for common testing tasks.
echo Keep it handy when you're writing or running tests.
echo.
pause

REM Conclusion
echo.
echo === Training Session Complete ===
echo.
echo Congratulations! You've completed the training session on testing the Learning Platform.
echo.
echo You've learned how to:
echo - Run different types of tests
echo - Interpret test results
echo - Write your own tests
echo - Use the test dashboard
echo - Find testing resources
echo.
echo Remember, good tests lead to better code quality, fewer bugs, and a better user experience.
echo.
echo If you have any questions, refer to the testing guide or ask for help in the #testing Slack channel.
echo.
echo Happy testing!
echo.
