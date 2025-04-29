describe('Visual Regression Tests', () => {
  const testUser = {
    email: 'visual-test@example.com',
    password: 'password123'
  };

  beforeEach(() => {
    // Register a test user if not already registered
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/auth/register`,
      body: {
        name: 'Visual Test User',
        email: testUser.email,
        password: testUser.password
      },
      failOnStatusCode: false
    });

    // Login before each test
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/auth/login`,
      body: {
        email: testUser.email,
        password: testUser.password
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      localStorage.setItem('token', response.body.token);
    });
  });

  it('should match dashboard visual snapshot', () => {
    cy.visit('/dashboard');
    cy.get('h1').contains('Dashboard').should('be.visible');
    
    // Wait for data to load
    cy.get('[data-testid="dashboard-stats"]', { timeout: 10000 }).should('be.visible');
    
    // Take a snapshot
    cy.percySnapshot('Dashboard');
  });

  it('should match learn page visual snapshot', () => {
    cy.visit('/learn');
    cy.get('h1').contains('Learn').should('be.visible');
    
    // Take a snapshot
    cy.percySnapshot('Learn Page');
  });

  it('should match content page visual snapshot', () => {
    cy.visit('/content');
    cy.get('h1').contains('My Content').should('be.visible');
    
    // Wait for content to load
    cy.get('[data-testid="content-list"]', { timeout: 10000 }).should('be.visible');
    
    // Take a snapshot
    cy.percySnapshot('Content Page');
  });

  it('should match profile page visual snapshot', () => {
    cy.visit('/profile');
    cy.get('h1').contains('Profile').should('be.visible');
    
    // Take a snapshot
    cy.percySnapshot('Profile Page');
  });

  it('should match gamification page visual snapshot', () => {
    cy.visit('/gamification');
    cy.get('h1').contains('Gamification').should('be.visible');
    
    // Wait for badges to load
    cy.get('[data-testid="badges-section"]', { timeout: 10000 }).should('be.visible');
    
    // Take a snapshot
    cy.percySnapshot('Gamification Page');
  });

  it('should match analytics page visual snapshot', () => {
    cy.visit('/analytics');
    cy.get('h1').contains('Analytics').should('be.visible');
    
    // Wait for charts to load
    cy.get('[data-testid="progress-chart"]', { timeout: 10000 }).should('be.visible');
    
    // Take a snapshot
    cy.percySnapshot('Analytics Page');
  });

  it('should match learning flow visual snapshots', () => {
    cy.visit('/learn');
    
    // Type a question
    cy.get('textarea[placeholder*="Ask a question"]').type('What is JavaScript?');
    
    // Take a snapshot before submitting
    cy.percySnapshot('Learn Page - Question Typed');
    
    // Submit the question
    cy.get('button').contains('Ask').click();
    
    // Wait for response
    cy.get('[data-testid="loading-indicator"]').should('be.visible');
    cy.percySnapshot('Learn Page - Loading');
    
    cy.get('[data-testid="response-content"]', { timeout: 10000 }).should('be.visible');
    
    // Take a snapshot after response
    cy.percySnapshot('Learn Page - Response');
  });

  it('should match responsive design snapshots', () => {
    // Test on mobile viewport
    cy.viewport('iphone-x');
    cy.visit('/dashboard');
    cy.get('h1').contains('Dashboard').should('be.visible');
    cy.percySnapshot('Dashboard - Mobile');
    
    // Test on tablet viewport
    cy.viewport('ipad-2');
    cy.visit('/dashboard');
    cy.get('h1').contains('Dashboard').should('be.visible');
    cy.percySnapshot('Dashboard - Tablet');
    
    // Test on desktop viewport
    cy.viewport(1280, 720);
    cy.visit('/dashboard');
    cy.get('h1').contains('Dashboard').should('be.visible');
    cy.percySnapshot('Dashboard - Desktop');
  });

  it('should match theme variations snapshots', () => {
    cy.visit('/dashboard');
    
    // Test light theme (default)
    cy.percySnapshot('Dashboard - Light Theme');
    
    // Toggle to dark theme
    cy.get('[data-testid="theme-toggle"]').click();
    
    // Take snapshot of dark theme
    cy.percySnapshot('Dashboard - Dark Theme');
  });
});
