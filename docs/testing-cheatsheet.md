# Testing Cheatsheet

A quick reference guide for common testing tasks in the Learning Platform.

## Running Tests

### Basic Tests

| Task | Command |
|------|---------|
| Run server tests | `cd server && npm test` |
| Run client tests | `cd client && npm test` |
| Run E2E tests | `./run-e2e-tests.sh` or `.\run-e2e-tests.bat` |

### Advanced Tests

| Task | Command |
|------|---------|
| Visual regression tests | `./run-visual-tests.sh` or `.\run-visual-tests.bat` |
| Accessibility tests | `./run-a11y-tests.sh` or `.\run-a11y-tests.bat` |
| Security tests | `./run-security-tests.sh` or `.\run-security-tests.bat` |
| Performance tests | `./run-performance-tests.sh` or `.\run-performance-tests.bat` |

### Test Coverage

| Task | Command |
|------|---------|
| Server coverage | `cd server && npm test -- --coverage` |
| Client coverage | `cd client && npm test -- --coverage --watchAll=false` |
| Analyze coverage | `./run-coverage-analysis.sh` or `.\run-coverage-analysis.bat` |

### Test Data

| Task | Command |
|------|---------|
| Generate test data | `./generate-test-data.sh` or `.\generate-test-data.bat` |

### Monitoring & Remediation

| Task | Command |
|------|---------|
| Update dashboard | `./run-dashboard-update.sh` or `.\run-dashboard-update.bat` |
| Auto-remediate issues | `./run-auto-remediate.sh` or `.\run-auto-remediate.bat` |

## Writing Tests

### Server Tests (Jest)

```javascript
// Basic test
test('should do something', () => {
  const result = someFunction();
  expect(result).toBe(expectedValue);
});

// Async test
test('should do something async', async () => {
  const result = await someAsyncFunction();
  expect(result).toBe(expectedValue);
});

// API test
test('should handle API request', async () => {
  const res = await request(app)
    .get('/api/endpoint')
    .set('Authorization', `Bearer ${token}`);
  
  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty('data');
});
```

### Client Tests (React Testing Library)

```javascript
// Render component
test('should render component', () => {
  render(<Component />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});

// User interaction
test('should handle click', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick} />);
  
  fireEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalled();
});

// Async component
test('should load data', async () => {
  render(<DataComponent />);
  
  // Wait for loading to complete
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

### End-to-End Tests (Cypress)

```javascript
// Visit page
it('should visit page', () => {
  cy.visit('/page');
  cy.get('h1').should('contain', 'Page Title');
});

// Form submission
it('should submit form', () => {
  cy.visit('/form');
  cy.get('input[name="email"]').type('test@example.com');
  cy.get('input[name="password"]').type('password123');
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});

// Visual test
it('should match visual snapshot', () => {
  cy.visit('/page');
  cy.percySnapshot('Page Name');
});

// Accessibility test
it('should pass accessibility tests', () => {
  cy.visit('/page');
  cy.injectAxe();
  cy.checkA11y();
});
```

## Common Assertions

### Jest Assertions

| Assertion | Example |
|-----------|---------|
| Equality | `expect(value).toBe(expected)` |
| Object equality | `expect(obj).toEqual(expectedObj)` |
| Truthiness | `expect(value).toBeTruthy()` |
| Falsiness | `expect(value).toBeFalsy()` |
| Defined | `expect(value).toBeDefined()` |
| Undefined | `expect(value).toBeUndefined()` |
| Null | `expect(value).toBeNull()` |
| Contains | `expect(array).toContain(item)` |
| Object property | `expect(obj).toHaveProperty('key')` |
| Throws | `expect(() => fn()).toThrow()` |
| Async resolves | `await expect(promise).resolves.toBe(value)` |
| Async rejects | `await expect(promise).rejects.toThrow()` |

### React Testing Library Assertions

| Assertion | Example |
|-----------|---------|
| In document | `expect(element).toBeInTheDocument()` |
| Visible | `expect(element).toBeVisible()` |
| Enabled | `expect(element).toBeEnabled()` |
| Disabled | `expect(element).toBeDisabled()` |
| Checked | `expect(element).toBeChecked()` |
| Value | `expect(element).toHaveValue('text')` |
| Text content | `expect(element).toHaveTextContent('text')` |
| Class | `expect(element).toHaveClass('class-name')` |
| Focus | `expect(element).toHaveFocus()` |
| Attribute | `expect(element).toHaveAttribute('attr', 'value')` |

### Cypress Assertions

| Assertion | Example |
|-----------|---------|
| Exist | `cy.get(selector).should('exist')` |
| Not exist | `cy.get(selector).should('not.exist')` |
| Be visible | `cy.get(selector).should('be.visible')` |
| Contain text | `cy.get(selector).should('contain', 'text')` |
| Have class | `cy.get(selector).should('have.class', 'class-name')` |
| Have value | `cy.get(selector).should('have.value', 'value')` |
| Have attribute | `cy.get(selector).should('have.attr', 'attr', 'value')` |
| URL | `cy.url().should('include', '/path')` |
| Length | `cy.get(selector).should('have.length', 5)` |

## Mocking

### Jest Mocks

```javascript
// Mock function
const mockFn = jest.fn();
mockFn.mockReturnValue('result');
mockFn.mockResolvedValue('async result');
mockFn.mockRejectedValue(new Error('error'));

// Mock module
jest.mock('../path/to/module', () => ({
  function1: jest.fn(),
  function2: jest.fn()
}));

// Spy on method
jest.spyOn(object, 'method').mockImplementation(() => 'result');

// Reset mocks
jest.resetAllMocks();
```

### React Testing Library Mocks

```javascript
// Mock context
const mockContextValue = { user: { name: 'Test' } };
render(
  <AuthContext.Provider value={mockContextValue}>
    <Component />
  </AuthContext.Provider>
);

// Mock router
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));
```

### Cypress Mocks

```javascript
// Stub network request
cy.intercept('GET', '/api/data', { fixture: 'data.json' });

// Stub network request with dynamic response
cy.intercept('POST', '/api/login', (req) => {
  req.reply({
    statusCode: 200,
    body: { token: 'fake-token' }
  });
});

// Spy on network request
cy.intercept('GET', '/api/data').as('getData');
cy.wait('@getData');
```

## Test Setup and Cleanup

### Jest Setup

```javascript
// Before all tests
beforeAll(() => {
  // Setup code
});

// After all tests
afterAll(() => {
  // Cleanup code
});

// Before each test
beforeEach(() => {
  // Setup code
});

// After each test
afterEach(() => {
  // Cleanup code
});
```

### Cypress Setup

```javascript
// In cypress/support/commands.js
Cypress.Commands.add('login', (email, password) => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: { email, password }
  }).then((response) => {
    localStorage.setItem('token', response.body.token);
  });
});

// In test file
beforeEach(() => {
  cy.login('test@example.com', 'password123');
});
```

## Debugging Tests

### Jest Debugging

```javascript
// Debug with console.log
test('should debug', () => {
  const result = someFunction();
  console.log('Result:', result);
  expect(result).toBe(expectedValue);
});

// Run specific test
npx jest -t "test name"

// Run with verbose output
npx jest --verbose

// Run in watch mode
npx jest --watch
```

### React Testing Library Debugging

```javascript
// Debug component
test('should debug component', () => {
  const { debug } = render(<Component />);
  debug();
  // or
  screen.debug();
});
```

### Cypress Debugging

```javascript
// Pause test
cy.pause();

// Debug with console.log
cy.get(selector).then(($el) => {
  console.log($el);
});

// Take screenshot
cy.screenshot();

// Open Cypress UI
npx cypress open
```

## Common Testing Patterns

### Testing Async Operations

```javascript
// With async/await
test('async operation', async () => {
  const result = await asyncFunction();
  expect(result).toBe(expected);
});

// With done callback
test('async operation', (done) => {
  asyncFunction().then((result) => {
    expect(result).toBe(expected);
    done();
  });
});

// With waitFor
test('async UI update', async () => {
  render(<AsyncComponent />);
  fireEvent.click(screen.getByRole('button'));
  
  await waitFor(() => {
    expect(screen.getByText('Updated')).toBeInTheDocument();
  });
});
```

### Testing Forms

```javascript
test('form submission', () => {
  const handleSubmit = jest.fn();
  render(<Form onSubmit={handleSubmit} />);
  
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'test@example.com' }
  });
  
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: 'password123' }
  });
  
  fireEvent.click(screen.getByRole('button', { name: /submit/i }));
  
  expect(handleSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123'
  });
});
```

### Testing Error Handling

```javascript
test('error handling', async () => {
  // Mock API error
  api.get.mockRejectedValue(new Error('API error'));
  
  render(<DataComponent />);
  
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Test timeouts | Increase timeout: `test('name', () => {}, 10000)` |
| Act warnings | Wrap in act: `await act(async () => { ... })` |
| Async errors | Use proper async/await or waitFor |
| Element not found | Check selectors, wait for element to appear |
| Mock not called | Check if mock is properly set up and imported |
| Test interference | Isolate tests, clean up after each test |
| Flaky tests | Add proper waiting, avoid timing dependencies |

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro)
- [Cypress Documentation](https://docs.cypress.io/guides/overview/why-cypress)
- [Testing Guide](./testing-guide.md) - Comprehensive testing guide for the Learning Platform
