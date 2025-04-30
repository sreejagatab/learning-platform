# Learning Platform Testing Guide

This guide provides comprehensive information on how to run, interpret, and create tests for the Learning Platform.

## Table of Contents

1. [Introduction](#introduction)
2. [Testing Philosophy](#testing-philosophy)
3. [Types of Tests](#types-of-tests)
4. [Running Tests](#running-tests)
5. [Interpreting Test Results](#interpreting-test-results)
6. [Writing Tests](#writing-tests)
7. [Advanced Testing](#advanced-testing)
8. [Test Monitoring](#test-monitoring)
9. [Automated Remediation](#automated-remediation)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

## Introduction

The Learning Platform uses a comprehensive testing strategy to ensure high quality and reliability. Our testing approach includes:

- **Unit Tests**: Testing individual components and functions
- **Integration Tests**: Testing interactions between components
- **End-to-End Tests**: Testing complete user flows
- **Performance Tests**: Testing system performance under load
- **Visual Regression Tests**: Testing UI appearance
- **Accessibility Tests**: Testing compliance with accessibility standards
- **Security Tests**: Testing for vulnerabilities

This guide will help you understand how to work with these different types of tests.

## Testing Philosophy

Our testing philosophy is based on the following principles:

1. **Test Early, Test Often**: We follow a test-driven development (TDD) approach when possible.
2. **Comprehensive Coverage**: We aim for high test coverage across all parts of the application.
3. **Realistic Testing**: Tests should reflect real-world usage as much as possible.
4. **Automated Testing**: Most tests should be automated and run as part of our CI/CD pipeline.
5. **Continuous Improvement**: We regularly analyze and improve our testing strategy.

## Types of Tests

### Unit Tests

Unit tests focus on testing individual functions, methods, or components in isolation. We use Jest for both server and client unit tests.

**Server Unit Tests**:
- Located in `server/tests/`
- Test individual functions and API endpoints
- Use supertest for API testing

**Client Unit Tests**:
- Located in `client/src/tests/`
- Test React components and utility functions
- Use React Testing Library for component testing

### Integration Tests

Integration tests verify that different parts of the application work together correctly.

**Server Integration Tests**:
- Located in `server/tests/integration/`
- Test interactions between different server components
- Test database operations

**Client Integration Tests**:
- Located in `client/src/tests/integration/`
- Test interactions between React components
- Test state management

### End-to-End Tests

End-to-end tests simulate real user interactions with the application.

- Located in `e2e/cypress/e2e/`
- Use Cypress to automate browser interactions
- Test complete user flows

### Performance Tests

Performance tests evaluate the system's performance under various conditions.

- Located in `performance-tests/`
- Use k6 for load testing
- Test API performance and scalability

### Visual Regression Tests

Visual regression tests detect unintended changes to the UI.

- Located in `e2e/cypress/e2e/visual-regression.cy.js`
- Use Percy to capture and compare screenshots
- Test UI appearance across different screen sizes

### Accessibility Tests

Accessibility tests ensure the application is usable by people with disabilities.

- Located in `e2e/cypress/e2e/accessibility.cy.js`
- Use axe-core to check for accessibility issues
- Test compliance with WCAG standards

### Security Tests

Security tests identify vulnerabilities in the application.

- Located in `security-tests/`
- Use dependency scanning to check for vulnerable packages
- Use OWASP ZAP for security scanning

### Edge Case Tests

Edge case tests verify the application's behavior in unusual or extreme situations.

- Located in `server/tests/edge-cases.test.js` and `client/src/tests/complex-scenarios.test.js`
- Test concurrent requests, large data, and error recovery
- Test boundary values and special characters

## Running Tests

### Basic Test Commands

**Run Server Tests**:
```bash
cd server
npm test
```

**Run Client Tests**:
```bash
cd client
npm test
```

**Run End-to-End Tests**:
```bash
# Unix/Linux/macOS
./run-e2e-tests.sh

# Windows
.\run-e2e-tests.bat
```

### Running Specific Tests

**Run a Specific Server Test File**:
```bash
cd server
npx jest tests/auth.test.js
```

**Run a Specific Client Test File**:
```bash
cd client
npx jest src/tests/Login.test.js
```

**Run a Specific Cypress Test**:
```bash
cd e2e
npx cypress run --spec "cypress/e2e/auth.cy.js"
```

### Running Tests with Coverage

**Server Coverage**:
```bash
cd server
npm test -- --coverage
```

**Client Coverage**:
```bash
cd client
npm test -- --coverage --watchAll=false
```

### Running Advanced Tests

**Visual Regression Tests**:
```bash
# Unix/Linux/macOS
./run-visual-tests.sh

# Windows
.\run-visual-tests.bat
```

**Accessibility Tests**:
```bash
# Unix/Linux/macOS
./run-a11y-tests.sh

# Windows
.\run-a11y-tests.bat
```

**Security Tests**:
```bash
# Unix/Linux/macOS
./run-security-tests.sh

# Windows
.\run-security-tests.bat
```

**Performance Tests**:
```bash
# Unix/Linux/macOS
./run-performance-tests.sh

# Windows
.\run-performance-tests.bat
```

**Generate Test Data**:
```bash
# Unix/Linux/macOS
./generate-test-data.sh

# Windows
.\generate-test-data.bat
```

## Interpreting Test Results

### Jest Test Results

Jest test results show:
- Number of tests run
- Number of tests passed
- Number of tests failed
- Test duration

Example output:
```
PASS  tests/auth.test.js
PASS  tests/learning.test.js
FAIL  tests/gamification.test.js
  ● Gamification API › should update daily goal

    expect(received).toBe(expected)

    Expected: 30
    Received: 20

Test Suites: 1 failed, 2 passed, 3 total
Tests:       1 failed, 15 passed, 16 total
Snapshots:   0 total
Time:        3.5s
```

**How to interpret**:
- Look for failed tests (marked with `FAIL`)
- Read the error message to understand what went wrong
- Check the expected vs. received values
- Look at the file path to locate the failing test

### Cypress Test Results

Cypress test results show:
- Test status (passed/failed)
- Screenshots of failures
- Videos of test runs
- Duration of each test

**How to interpret**:
- Check the overall test status
- For failed tests, review the screenshots and videos
- Look at the error messages in the console
- Check the test steps that led to the failure

### Coverage Reports

Coverage reports show:
- Statement coverage: percentage of code statements executed
- Branch coverage: percentage of code branches executed
- Function coverage: percentage of functions called
- Line coverage: percentage of code lines executed

**How to interpret**:
- Look for areas with low coverage
- Focus on critical files with low coverage
- Check uncovered branches for potential edge cases
- Use the coverage report to identify areas for new tests

### Visual Regression Results

Visual regression results show:
- Screenshots of the UI
- Visual differences between baseline and current UI
- Percentage of pixels changed

**How to interpret**:
- Review visual differences to determine if they are intentional
- Check if layout or styling issues are present
- Verify that UI changes match the expected design

### Accessibility Results

Accessibility results show:
- Accessibility violations by severity
- Elements with accessibility issues
- Suggestions for fixing issues

**How to interpret**:
- Focus on critical and serious issues first
- Check the affected elements
- Review the suggested fixes
- Verify that fixes address the underlying accessibility concerns

### Security Test Results

Security test results show:
- Vulnerable dependencies
- Security vulnerabilities by severity
- Potential attack vectors
- Recommendations for fixing issues

**How to interpret**:
- Address critical vulnerabilities immediately
- Review high and moderate vulnerabilities
- Check if vulnerabilities affect production code
- Follow the recommended fixes

## Writing Tests

### Writing Server Tests

Server tests use Jest and supertest. Here's a basic example:

```javascript
const request = require('supertest');
const app = require('../app');
const User = require('../models/user.model');

describe('Auth API', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  test('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.name).toBe('Test User');
  });
});
```

**Key practices**:
- Use descriptive test names
- Set up and clean up test data
- Test both success and error cases
- Use assertions to verify results

### Writing Client Tests

Client tests use Jest and React Testing Library. Here's a basic example:

```javascript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '../components/Login';

describe('Login Component', () => {
  test('renders login form', () => {
    render(<Login />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });
  
  test('handles form submission', () => {
    const mockLogin = jest.fn();
    render(<Login login={mockLogin} />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
});
```

**Key practices**:
- Test component rendering
- Test user interactions
- Test state changes
- Use mock functions for dependencies

### Writing End-to-End Tests

End-to-end tests use Cypress. Here's a basic example:

```javascript
describe('Authentication Flow', () => {
  it('should register a new user', () => {
    cy.visit('/register');
    
    cy.get('input[name="name"]').type('Test User');
    cy.get('input[name="email"]').type(`test${Date.now()}@example.com`);
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('password123');
    
    cy.get('button[type="submit"]').click();
    
    cy.url().should('include', '/dashboard');
    cy.get('h1').should('contain', 'Dashboard');
  });
});
```

**Key practices**:
- Test complete user flows
- Use unique test data
- Wait for elements to appear
- Verify navigation and UI state

### Writing Visual Regression Tests

Visual regression tests use Cypress and Percy. Here's a basic example:

```javascript
describe('Visual Regression Tests', () => {
  it('should match dashboard visual snapshot', () => {
    cy.login('test@example.com', 'password123');
    cy.visit('/dashboard');
    
    cy.get('h1').contains('Dashboard').should('be.visible');
    cy.percySnapshot('Dashboard');
  });
});
```

**Key practices**:
- Test key pages and components
- Test different screen sizes
- Test different states (logged in, empty state, etc.)
- Use descriptive snapshot names

### Writing Accessibility Tests

Accessibility tests use Cypress and axe-core. Here's a basic example:

```javascript
describe('Accessibility Tests', () => {
  it('should pass accessibility tests on the login page', () => {
    cy.visit('/login');
    cy.injectAxe();
    cy.checkA11y();
  });
});
```

**Key practices**:
- Test all pages and key components
- Test with keyboard navigation
- Test with different viewport sizes
- Address all critical and serious issues

## Advanced Testing

### Test Data Generation

We use a test data generator to create realistic test data:

```bash
# Unix/Linux/macOS
./generate-test-data.sh

# Windows
.\generate-test-data.bat
```

This creates:
- Test users with different roles
- Content items of various types
- Learning history and activity data
- Gamification data (badges, points, etc.)

### Mocking and Stubbing

**Mocking API Calls**:

```javascript
// Mock the API service
jest.mock('../services/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

// Import the mocked API
import api from '../services/api';

// Set up mock response
api.get.mockResolvedValue({ data: { id: 1, name: 'Test' } });
```

**Stubbing Browser APIs**:

```javascript
// Stub localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Stub fetch
global.fetch = jest.fn().mockResolvedValue({
  json: jest.fn().mockResolvedValue({ data: 'test' }),
  ok: true
});
```

### Testing Asynchronous Code

**Testing Promises**:

```javascript
test('should fetch data asynchronously', async () => {
  const data = await fetchData();
  expect(data).toEqual({ id: 1, name: 'Test' });
});
```

**Testing with act()**:

```javascript
import { act } from 'react-dom/test-utils';

test('should update state asynchronously', async () => {
  render(<AsyncComponent />);
  
  await act(async () => {
    fireEvent.click(screen.getByRole('button'));
    // Wait for state update
  });
  
  expect(screen.getByText('Updated')).toBeInTheDocument();
});
```

### Testing Error Handling

**Testing API Errors**:

```javascript
test('should handle API errors', async () => {
  api.get.mockRejectedValue(new Error('Network error'));
  
  render(<DataComponent />);
  
  await waitFor(() => {
    expect(screen.getByText('Error: Network error')).toBeInTheDocument();
  });
});
```

**Testing Form Validation Errors**:

```javascript
test('should show validation errors', async () => {
  render(<LoginForm />);
  
  fireEvent.click(screen.getByRole('button', { name: /login/i }));
  
  expect(screen.getByText('Email is required')).toBeInTheDocument();
  expect(screen.getByText('Password is required')).toBeInTheDocument();
});
```

## Test Monitoring

We use a test dashboard to monitor test results over time:

```bash
# Unix/Linux/macOS
./run-dashboard-update.sh

# Windows
.\run-dashboard-update.bat
```

The dashboard shows:
- Test pass/fail trends
- Code coverage trends
- Security vulnerabilities
- Accessibility issues
- Performance metrics
- Visual regression changes

**How to use the dashboard**:
1. Run the dashboard update script
2. Open the dashboard in your browser
3. Review the metrics and trends
4. Focus on areas with declining metrics
5. Use the dashboard to prioritize testing efforts

## Automated Remediation

We use an automated remediation system to fix common issues:

```bash
# Unix/Linux/macOS
./run-auto-remediate.sh

# Windows
.\run-auto-remediate.bat
```

The remediation system can fix:
- Security vulnerabilities by updating dependencies
- Accessibility issues like missing alt text and labels
- Test timeouts by increasing timeout values
- React act() warnings by wrapping state updates

**How to use automated remediation**:
1. Run the auto-remediation script
2. Review the suggested fixes
3. Apply the fixes if they look correct
4. Run tests again to verify the fixes

## Best Practices

### General Testing Best Practices

1. **Write tests before code** when possible (TDD approach)
2. **Keep tests simple and focused** on one behavior
3. **Use descriptive test names** that explain what's being tested
4. **Isolate tests** from each other
5. **Clean up after tests** to avoid affecting other tests
6. **Don't test implementation details** but focus on behavior
7. **Use realistic test data** that mimics production
8. **Test edge cases** and error conditions
9. **Keep tests fast** to encourage frequent running
10. **Review test coverage** regularly

### Server Testing Best Practices

1. **Test all API endpoints** for success and error cases
2. **Test database operations** with a test database
3. **Test authentication and authorization** thoroughly
4. **Mock external services** to isolate tests
5. **Test validation logic** with valid and invalid data

### Client Testing Best Practices

1. **Test component rendering** with different props
2. **Test user interactions** like clicks and form submissions
3. **Test state changes** and side effects
4. **Test error handling** and loading states
5. **Use snapshot testing** for UI components

### End-to-End Testing Best Practices

1. **Focus on critical user flows** rather than testing everything
2. **Use stable selectors** like data-testid attributes
3. **Handle asynchronous operations** properly
4. **Clean up test data** after tests
5. **Keep E2E tests independent** of each other

## Troubleshooting

### Common Issues and Solutions

**Tests Failing Intermittently**:
- Check for race conditions in asynchronous code
- Add proper waiting for elements and state changes
- Isolate tests from each other
- Check for shared state between tests

**Slow Tests**:
- Reduce the number of end-to-end tests
- Mock expensive operations
- Use more unit tests and fewer integration tests
- Run tests in parallel when possible

**Low Test Coverage**:
- Identify uncovered code areas using coverage reports
- Focus on critical and complex code first
- Add tests for error handling and edge cases
- Use the coverage analysis tool to get suggestions

**Visual Regression Failures**:
- Check if UI changes are intentional
- Update baselines if changes are expected
- Fix CSS issues if changes are unintended
- Test on consistent browser versions

**Accessibility Test Failures**:
- Address critical issues first
- Fix missing labels, alt text, and ARIA attributes
- Ensure proper color contrast
- Test with keyboard navigation

**Security Test Failures**:
- Update vulnerable dependencies
- Follow security best practices
- Address critical vulnerabilities immediately
- Run security tests regularly

### Getting Help

If you encounter issues with tests, you can:
1. Check this guide for solutions
2. Review the test code and error messages
3. Run the test with verbose output (`--verbose`)
4. Ask for help in the #testing Slack channel
5. Create a ticket for complex testing issues

## Conclusion

Testing is a critical part of our development process. By following this guide, you'll be able to effectively run, interpret, and create tests for the Learning Platform. Remember that good tests lead to better code quality, fewer bugs, and a better user experience.

If you have suggestions for improving our testing process, please share them with the team!
