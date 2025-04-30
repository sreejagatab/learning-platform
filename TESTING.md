# Testing Documentation for Learning Platform

This document provides an overview of the testing strategy and instructions for running tests for the Learning Platform project.

## Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Test Types](#test-types)
3. [Running Tests](#running-tests)
4. [Continuous Integration](#continuous-integration)
5. [Test Coverage](#test-coverage)
6. [Performance Testing](#performance-testing)
7. [End-to-End Testing](#end-to-end-testing)
8. [Visual Regression Testing](#visual-regression-testing)
9. [Accessibility Testing](#accessibility-testing)
10. [Security Testing](#security-testing)
11. [Test Data Generation](#test-data-generation)
12. [Troubleshooting](#troubleshooting)

## Testing Strategy

Our testing strategy follows the testing pyramid approach:

- **Unit Tests**: Testing individual components, functions, and models in isolation.
- **Integration Tests**: Testing interactions between components and services.
- **API Tests**: Testing API endpoints and responses.
- **End-to-End Tests**: Testing complete user flows from the UI to the database.
- **Performance Tests**: Testing system performance under load.

## Test Types

### Server-Side Tests

1. **API Tests** (`server/tests/api.test.js`):
   - Tests all API endpoints
   - Covers authentication, learning, gamification, and analytics APIs
   - Tests successful operations and error handling

2. **Error Handling Tests** (`server/tests/error-handling.test.js`):
   - Tests error responses for invalid inputs
   - Tests authentication errors
   - Tests rate limiting
   - Tests database connection errors
   - Tests external API errors

3. **Model Tests** (`server/tests/models.test.js`):
   - Tests all database models
   - Tests validation rules
   - Tests model methods

4. **Controller Tests** (`server/tests/controllers.test.js`):
   - Tests controller functions
   - Tests business logic
   - Tests data manipulation

5. **Middleware Tests** (`server/tests/middleware.test.js`):
   - Tests authentication middleware
   - Tests role-based access control
   - Tests rate limiting middleware
   - Tests validation middleware
   - Tests error handling middleware

### Client-Side Tests

1. **Integration Tests** (`client/src/tests/integration.test.js`):
   - Tests interactions between components
   - Tests data flow through the application
   - Tests user flows

2. **Error Handling Tests** (`client/src/tests/error-handling.test.js`):
   - Tests form validation
   - Tests API error handling
   - Tests session expiration handling
   - Tests network error handling

3. **Component Tests** (`client/src/tests/components.test.js`):
   - Tests individual UI components
   - Tests component rendering
   - Tests component interactions

4. **Context Tests** (`client/src/tests/context.test.js`):
   - Tests context providers
   - Tests state management
   - Tests context API methods

### End-to-End Tests

1. **Authentication Flow** (`e2e/cypress/e2e/auth.cy.js`):
   - Tests user registration
   - Tests user login
   - Tests validation errors
   - Tests user logout

2. **Learning Flow** (`e2e/cypress/e2e/learning.cy.js`):
   - Tests asking questions
   - Tests follow-up questions
   - Tests saving content
   - Tests generating learning paths

### Performance Tests

1. **API Load Test** (`performance-tests/api-load-test.js`):
   - Tests API performance under load
   - Tests authentication endpoints
   - Tests learning endpoints
   - Tests gamification endpoints
   - Tests analytics endpoints

### Visual Regression Tests

1. **Page Visual Tests** (`e2e/cypress/e2e/visual-regression.cy.js`):
   - Tests visual appearance of all pages
   - Tests responsive design across different screen sizes
   - Tests theme variations
   - Tests interactive elements like forms and modals

### Accessibility Tests

1. **Page Accessibility Tests** (`e2e/cypress/e2e/accessibility.cy.js`):
   - Tests WCAG compliance
   - Tests keyboard navigation
   - Tests screen reader compatibility
   - Tests color contrast and readability

### Security Tests

1. **Dependency Vulnerability Check** (`security-tests/dependency-check.js`):
   - Scans for vulnerabilities in npm dependencies
   - Generates reports of security issues
   - Categorizes vulnerabilities by severity

2. **API Security Scan** (`security-tests/zap-api-scan.sh`):
   - Tests API endpoints for security vulnerabilities
   - Checks for OWASP Top 10 vulnerabilities
   - Tests authentication and authorization

3. **Full Application Scan** (`security-tests/zap-full-scan.sh`):
   - Tests the entire application for security vulnerabilities
   - Checks for client-side vulnerabilities
   - Tests for cross-site scripting and injection attacks

### Edge Case Tests

1. **Edge Case Tests** (`server/tests/edge-cases.test.js`):
   - Tests concurrent requests
   - Tests large data handling
   - Tests unicode and special characters
   - Tests race conditions
   - Tests error recovery
   - Tests boundary values

2. **Complex Client Scenarios** (`client/src/tests/complex-scenarios.test.js`):
   - Tests network resilience
   - Tests state management across navigation
   - Tests performance optimization
   - Tests accessibility with keyboard navigation
   - Tests error boundaries

## Running Tests

### Running All Tests

On Windows:
```
.\run-all-tests.bat
```

On Unix/Linux/macOS:
```
chmod +x run-all-tests.sh
./run-all-tests.sh
```

### Running Server Tests Only

```
cd server
npm test
```

### Running Client Tests Only

```
cd client
npm test
```

### Running Specific Test Files

Server:
```
cd server
npx jest tests/api.test.js
```

Client:
```
cd client
npm test -- -t "component tests"
```

### Running End-to-End Tests

On Windows:
```
.\run-e2e-tests.bat
```

On Unix/Linux/macOS:
```
chmod +x run-e2e-tests.sh
./run-e2e-tests.sh
```

To open Cypress Test Runner:
```
cd e2e
npx cypress open
```

### Running Performance Tests

On Windows:
```
.\run-performance-tests.bat
```

On Unix/Linux/macOS:
```
chmod +x run-performance-tests.sh
./run-performance-tests.sh
```

## Continuous Integration

We use GitHub Actions for continuous integration. The workflow is defined in `.github/workflows/ci.yml`.

The CI pipeline:
1. Runs server tests
2. Runs client tests
3. Checks code linting
4. Uploads coverage reports to Codecov

## Test Coverage

To generate test coverage reports:

On Windows:
```
.\coverage-report.bat
```

On Unix/Linux/macOS:
```
chmod +x coverage-report.sh
./coverage-report.sh
```

Coverage reports are generated in:
- Server: `server/coverage/lcov-report/index.html`
- Client: `client/coverage/lcov-report/index.html`

## Performance Testing

Performance tests are implemented using k6. To run performance tests:

1. Make sure your server is running on http://localhost:5000
2. Run the performance test script:

On Windows:
```
.\run-performance-tests.bat
```

On Unix/Linux/macOS:
```
chmod +x run-performance-tests.sh
./run-performance-tests.sh
```

## End-to-End Testing

End-to-end tests are implemented using Cypress. To run end-to-end tests:

1. Make sure your server is running on http://localhost:5000
2. Make sure your client is running on http://localhost:3000
3. Run the end-to-end test script:

On Windows:
```
.\run-e2e-tests.bat
```

On Unix/Linux/macOS:
```
chmod +x run-e2e-tests.sh
./run-e2e-tests.sh
```

## Visual Regression Testing

Visual regression tests are implemented using Cypress and Percy. To run visual regression tests:

1. Make sure your server is running on http://localhost:5000
2. Make sure your client is running on http://localhost:3000
3. Set your Percy token: `export PERCY_TOKEN=your_token` (Unix/Linux/macOS) or `set PERCY_TOKEN=your_token` (Windows)
4. Run the visual regression test script:

On Windows:
```
.\run-visual-tests.bat
```

On Unix/Linux/macOS:
```
chmod +x run-visual-tests.sh
./run-visual-tests.sh
```

## Accessibility Testing

Accessibility tests are implemented using Cypress and axe-core. To run accessibility tests:

1. Make sure your server is running on http://localhost:5000
2. Make sure your client is running on http://localhost:3000
3. Run the accessibility test script:

On Windows:
```
.\run-a11y-tests.bat
```

On Unix/Linux/macOS:
```
chmod +x run-a11y-tests.sh
./run-a11y-tests.sh
```

## Security Testing

Security tests include dependency vulnerability scanning and OWASP ZAP scans. To run security tests:

1. Make sure your server is running on http://localhost:5000
2. Make sure your client is running on http://localhost:3000
3. Run the security test script:

On Windows:
```
.\run-security-tests.bat
```

On Unix/Linux/macOS:
```
chmod +x run-security-tests.sh
./run-security-tests.sh
```

To run only dependency vulnerability checks:

On Windows:
```
.\run-dependency-check.bat
```

On Unix/Linux/macOS:
```
chmod +x run-dependency-check.sh
./run-dependency-check.sh
```

## Test Data Generation

To generate realistic test data for testing:

On Windows:
```
.\generate-test-data.bat
```

On Unix/Linux/macOS:
```
chmod +x generate-test-data.sh
./generate-test-data.sh
```

## Troubleshooting

### Common Issues

1. **Tests failing due to MongoDB connection issues**:
   - Make sure MongoDB is running
   - Check the connection string in `server/config/default.json`

2. **End-to-end tests failing**:
   - Make sure both server and client are running
   - Check that the URLs in `e2e/cypress.config.js` are correct

3. **Performance tests failing**:
   - Make sure the server is running
   - Check that the URL in `performance-tests/api-load-test.js` is correct

4. **Visual regression tests failing**:
   - Make sure you have set the PERCY_TOKEN environment variable
   - Check that Percy is properly configured in `e2e/cypress/support/e2e.js`
   - Verify that the application is in a consistent visual state

5. **Accessibility tests failing**:
   - Check the accessibility issues reported in the test output
   - Verify that all elements have proper ARIA attributes
   - Ensure color contrast meets WCAG standards

6. **Security tests failing**:
   - For dependency vulnerabilities, check the reports in `security-tests/reports/`
   - For ZAP scans, make sure Docker is installed and running
   - Review the security reports and address the issues based on severity

7. **Test data generation failing**:
   - Make sure MongoDB is running
   - Check that the server has write permissions to the database
   - Verify that the Faker.js library is installed

8. **Test timeouts**:
   - Increase the timeout in `server/tests/setup.js`
   - For Cypress tests, add a longer timeout: `{ timeout: 10000 }`

### Getting Help

If you encounter issues that aren't covered here, please:
1. Check the error logs
2. Search for similar issues in the project repository
3. Contact the development team
