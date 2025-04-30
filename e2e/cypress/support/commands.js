// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to check accessibility on the current page
Cypress.Commands.add('checkA11y', (context, options) => {
  cy.injectAxe();
  cy.checkA11y(context, options);
});

// Custom command to check accessibility on the current page and log violations
Cypress.Commands.add('checkA11yAndLog', (context, options) => {
  cy.injectAxe();
  cy.checkA11y(context, options, (violations) => {
    // Log violations to the console
    cy.task('log', `${violations.length} accessibility violations detected`);
    
    // Log each violation
    violations.forEach((violation) => {
      const nodes = Cypress.$(violation.nodes.map((node) => node.target).join(','));
      
      cy.task('log', {
        message: `${violation.id} - ${violation.impact}: ${violation.help}`,
        nodes: nodes.length,
        helpUrl: violation.helpUrl
      });
      
      // Highlight elements with violations
      nodes.each((index, node) => {
        Cypress.$(node).css('border', '3px solid #f00');
      });
    });
  });
});

// Custom command to login
Cypress.Commands.add('login', (email, password) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/login`,
    body: {
      email,
      password
    }
  }).then((response) => {
    expect(response.status).to.eq(200);
    localStorage.setItem('token', response.body.token);
  });
});

// Custom command to register
Cypress.Commands.add('register', (name, email, password) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/register`,
    body: {
      name,
      email,
      password
    },
    failOnStatusCode: false
  });
});
