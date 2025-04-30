describe('Accessibility Tests', () => {
  const testUser = {
    name: 'A11y Test User',
    email: 'a11y-test@example.com',
    password: 'password123'
  };

  beforeEach(() => {
    // Register a test user if not already registered
    cy.register(testUser.name, testUser.email, testUser.password);

    // Login before each test
    cy.login(testUser.email, testUser.password);
  });

  it('should pass accessibility tests on the dashboard page', () => {
    cy.visit('/dashboard');
    cy.get('h1').contains('Dashboard').should('be.visible');
    
    // Wait for data to load
    cy.get('[data-testid="dashboard-stats"]', { timeout: 10000 }).should('be.visible');
    
    // Run accessibility tests
    cy.checkA11yAndLog();
  });

  it('should pass accessibility tests on the learn page', () => {
    cy.visit('/learn');
    cy.get('h1').contains('Learn').should('be.visible');
    
    // Run accessibility tests
    cy.checkA11yAndLog();
  });

  it('should pass accessibility tests on the content page', () => {
    cy.visit('/content');
    cy.get('h1').contains('My Content').should('be.visible');
    
    // Wait for content to load
    cy.get('[data-testid="content-list"]', { timeout: 10000 }).should('be.visible');
    
    // Run accessibility tests
    cy.checkA11yAndLog();
  });

  it('should pass accessibility tests on the profile page', () => {
    cy.visit('/profile');
    cy.get('h1').contains('Profile').should('be.visible');
    
    // Run accessibility tests
    cy.checkA11yAndLog();
  });

  it('should pass accessibility tests on the gamification page', () => {
    cy.visit('/gamification');
    cy.get('h1').contains('Gamification').should('be.visible');
    
    // Wait for badges to load
    cy.get('[data-testid="badges-section"]', { timeout: 10000 }).should('be.visible');
    
    // Run accessibility tests
    cy.checkA11yAndLog();
  });

  it('should pass accessibility tests on the analytics page', () => {
    cy.visit('/analytics');
    cy.get('h1').contains('Analytics').should('be.visible');
    
    // Wait for charts to load
    cy.get('[data-testid="progress-chart"]', { timeout: 10000 }).should('be.visible');
    
    // Run accessibility tests
    cy.checkA11yAndLog();
  });

  it('should pass accessibility tests on the login page', () => {
    // Logout first
    cy.window().then((win) => {
      win.localStorage.removeItem('token');
    });
    
    cy.visit('/login');
    cy.get('h1').contains('Login').should('be.visible');
    
    // Run accessibility tests
    cy.checkA11yAndLog();
  });

  it('should pass accessibility tests on the registration page', () => {
    // Logout first
    cy.window().then((win) => {
      win.localStorage.removeItem('token');
    });
    
    cy.visit('/register');
    cy.get('h1').contains('Register').should('be.visible');
    
    // Run accessibility tests
    cy.checkA11yAndLog();
  });

  it('should pass accessibility tests on the learning flow', () => {
    cy.visit('/learn');
    
    // Type a question
    cy.get('textarea[placeholder*="Ask a question"]').type('What is JavaScript?');
    
    // Run accessibility tests before submitting
    cy.checkA11yAndLog();
    
    // Submit the question
    cy.get('button').contains('Ask').click();
    
    // Wait for response
    cy.get('[data-testid="response-content"]', { timeout: 10000 }).should('be.visible');
    
    // Run accessibility tests after response
    cy.checkA11yAndLog();
  });

  it('should pass accessibility tests with keyboard navigation', () => {
    cy.visit('/dashboard');
    
    // Focus on the first focusable element
    cy.focused().should('exist');
    
    // Tab through the page and check accessibility at each step
    for (let i = 0; i < 10; i++) {
      cy.focused().then($el => {
        // Run accessibility tests on the focused element
        cy.checkA11yAndLog($el);
        
        // Press tab to move to the next element
        cy.focused().tab();
      });
    }
  });

  it('should pass accessibility tests with screen reader announcements', () => {
    cy.visit('/learn');
    
    // Check for proper ARIA attributes
    cy.get('[aria-live]').should('exist');
    
    // Type a question
    cy.get('textarea[placeholder*="Ask a question"]').type('What is JavaScript?');
    
    // Submit the question
    cy.get('button').contains('Ask').click();
    
    // Wait for loading indicator
    cy.get('[data-testid="loading-indicator"]').should('be.visible');
    
    // Check that loading state is properly announced
    cy.get('[aria-live="polite"]').should('exist');
    
    // Wait for response
    cy.get('[data-testid="response-content"]', { timeout: 10000 }).should('be.visible');
    
    // Check that response is properly announced
    cy.get('[aria-live="polite"]').should('exist');
  });
});
