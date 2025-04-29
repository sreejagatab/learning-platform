describe('Learning Flow', () => {
  const testUser = {
    email: `cypress-test-${Date.now()}@example.com`,
    password: 'password123'
  };

  beforeEach(() => {
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

    cy.visit('/dashboard');
  });

  it('should navigate to learn page', () => {
    // Click on Learn in the navigation
    cy.get('a').contains('Learn').click();
    cy.url().should('include', '/learn');
    cy.get('h1').contains('Learn').should('be.visible');
  });

  it('should ask a question and get a response', () => {
    // Navigate to learn page
    cy.get('a').contains('Learn').click();

    // Type a question
    cy.get('textarea[placeholder*="Ask a question"]').type('What is JavaScript?');

    // Submit the question
    cy.get('button').contains('Ask').click();

    // Wait for response
    cy.get('[data-testid="loading-indicator"]').should('be.visible');
    cy.get('[data-testid="response-content"]', { timeout: 10000 }).should('be.visible');

    // Response should contain relevant information
    cy.get('[data-testid="response-content"]').should('contain.text', 'JavaScript');

    // Should show follow-up questions
    cy.get('[data-testid="follow-up-questions"]').should('be.visible');
    cy.get('[data-testid="follow-up-questions"] button').should('have.length.at.least', 1);
  });

  it('should ask a follow-up question', () => {
    // Navigate to learn page
    cy.get('a').contains('Learn').click();

    // Type a question
    cy.get('textarea[placeholder*="Ask a question"]').type('What is JavaScript?');

    // Submit the question
    cy.get('button').contains('Ask').click();

    // Wait for response
    cy.get('[data-testid="response-content"]', { timeout: 10000 }).should('be.visible');

    // Click on a follow-up question
    cy.get('[data-testid="follow-up-questions"] button').first().click();

    // Wait for follow-up response
    cy.get('[data-testid="loading-indicator"]').should('be.visible');
    cy.get('[data-testid="response-content"]', { timeout: 10000 }).should('be.visible');

    // Should show the conversation history
    cy.get('[data-testid="conversation-history"]').should('be.visible');
    cy.get('[data-testid="conversation-history"] [data-testid="message"]').should('have.length.at.least', 3);
  });

  it('should save content', () => {
    // Navigate to learn page
    cy.get('a').contains('Learn').click();

    // Type a question
    cy.get('textarea[placeholder*="Ask a question"]').type('What is JavaScript?');

    // Submit the question
    cy.get('button').contains('Ask').click();

    // Wait for response
    cy.get('[data-testid="response-content"]', { timeout: 10000 }).should('be.visible');

    // Click save button
    cy.get('button').contains('Save').click();

    // Fill in save form
    cy.get('input[name="title"]').type('JavaScript Notes');
    cy.get('select[name="type"]').select('note');

    // Submit save form
    cy.get('button').contains('Save Content').click();

    // Should show success message
    cy.get('[data-testid="toast-success"]').should('be.visible');
    cy.get('[data-testid="toast-success"]').should('contain.text', 'Content saved');

    // Navigate to My Content
    cy.get('a').contains('My Content').click();
    cy.url().should('include', '/content');

    // Should see the saved content
    cy.get('[data-testid="content-list"]').should('be.visible');
    cy.get('[data-testid="content-item"]').should('contain.text', 'JavaScript Notes');
  });

  it('should generate a learning path', () => {
    // Navigate to learn page
    cy.get('a').contains('Learn').click();

    // Click on Learning Path button
    cy.get('button').contains('Learning Path').click();

    // Fill in learning path form
    cy.get('input[name="topic"]').type('JavaScript');
    cy.get('select[name="level"]').select('beginner');

    // Submit form
    cy.get('button').contains('Generate').click();

    // Wait for learning path to be generated
    cy.get('[data-testid="loading-indicator"]').should('be.visible');
    cy.get('[data-testid="learning-path"]', { timeout: 10000 }).should('be.visible');

    // Should show the learning path
    cy.get('[data-testid="learning-path-topic"]').should('contain.text', 'JavaScript');
    cy.get('[data-testid="learning-path-steps"]').should('be.visible');
    cy.get('[data-testid="learning-path-steps"] [data-testid="step"]').should('have.length.at.least', 3);
  });
});
