describe('Authentication Flow', () => {
  const testUser = {
    name: 'Cypress Test User',
    email: `cypress-test-${Date.now()}@example.com`,
    password: 'password123'
  };

  beforeEach(() => {
    // Clear localStorage before each test
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('should register a new user', () => {
    // Navigate to register page
    cy.get('a').contains('Register').click();
    cy.url().should('include', '/register');

    // Fill in registration form
    cy.get('input[name="name"]').type(testUser.name);
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('input[name="confirmPassword"]').type(testUser.password);

    // Submit form
    cy.get('button').contains('Register').click();

    // Should redirect to dashboard after successful registration
    cy.url().should('include', '/dashboard');
    cy.get('h1').contains('Dashboard').should('be.visible');
    cy.get('div').contains(testUser.name).should('be.visible');
  });

  it('should login an existing user', () => {
    // Navigate to login page
    cy.get('a').contains('Login').click();
    cy.url().should('include', '/login');

    // Fill in login form
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);

    // Submit form
    cy.get('button').contains('Login').click();

    // Should redirect to dashboard after successful login
    cy.url().should('include', '/dashboard');
    cy.get('h1').contains('Dashboard').should('be.visible');
    cy.get('div').contains(testUser.name).should('be.visible');
  });

  it('should display validation errors', () => {
    // Navigate to login page
    cy.get('a').contains('Login').click();
    cy.url().should('include', '/login');

    // Submit form without filling it
    cy.get('button').contains('Login').click();

    // Should display validation errors
    cy.get('div').contains('Email is required').should('be.visible');
    cy.get('div').contains('Password is required').should('be.visible');

    // Fill in with invalid data
    cy.get('input[name="email"]').type('not-an-email');
    cy.get('input[name="password"]').type('123'); // Too short

    // Submit form
    cy.get('button').contains('Login').click();

    // Should display validation errors
    cy.get('div').contains('Invalid email').should('be.visible');
    cy.get('div').contains('Password must be at least').should('be.visible');
  });

  it('should logout a user', () => {
    // Login first
    cy.get('a').contains('Login').click();
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('button').contains('Login').click();

    // Wait for dashboard to load
    cy.url().should('include', '/dashboard');

    // Click logout button
    cy.get('button').contains('Logout').click();

    // Should redirect to home page after logout
    cy.url().should('not.include', '/dashboard');
    cy.get('a').contains('Login').should('be.visible');
    cy.get('a').contains('Register').should('be.visible');
  });
});
