// Import commands.js using ES2015 syntax:
import './commands';

// Import Percy
import '@percy/cypress';

// Import axe-core for accessibility testing
import 'cypress-axe';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests from command log
const app = window.top;
if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML =
    '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}

// Disable screenshots and videos during regular test runs (not visual)
if (!Cypress.env('PERCY_TOKEN')) {
  Cypress.config('screenshotOnRunFailure', false);
  Cypress.config('video', false);
}

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  return false;
});
