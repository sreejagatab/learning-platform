// Set test environment
process.env.NODE_ENV = 'test';

// Increase timeout for tests
jest.setTimeout(30000);

// Silence console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

// Mock config
jest.mock('config', () => ({
  get: jest.fn((key) => {
    switch (key) {
      case 'mongoURI':
        return 'mongodb://localhost:27017/learning-platform-test';
      case 'jwtSecret':
        return 'test-jwt-secret';
      case 'jwtExpiration':
        return '1h';
      default:
        return '';
    }
  }),
}));
