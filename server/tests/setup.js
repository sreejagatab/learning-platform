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
      case 'useMockData':
        return true;
      case 'sonarApiKey':
        return 'test-sonar-api-key';
      default:
        return '';
    }
  }),
}));

// Configure prompt engineering for tests
try {
  const promptEngineering = require('../services/prompts');

  // Store original config
  beforeAll(() => {
    global.__ORIGINAL_PROMPT_CONFIG__ = { ...promptEngineering.config };

    // Configure for testing
    promptEngineering.configurePromptEngineering({
      useAdvancedPrompts: true,
      useContextRetention: true,
      debugMode: false
    });
  });

  // Restore original config
  afterAll(() => {
    if (global.__ORIGINAL_PROMPT_CONFIG__) {
      promptEngineering.configurePromptEngineering(global.__ORIGINAL_PROMPT_CONFIG__);
    }
  });

  // Helper function for testing prompts
  global.testPromptGeneration = (prompt, options = {}) => {
    const {
      shouldIncludeQuery = true,
      shouldHaveSystemPrompt = true,
      minSystemPromptLength = 100,
      minTextLength = 20
    } = options;

    // Basic structure checks
    expect(prompt).toBeDefined();
    expect(prompt).toHaveProperty('text');
    if (shouldHaveSystemPrompt) {
      expect(prompt).toHaveProperty('systemPrompt');
    }

    // Content checks
    if (shouldIncludeQuery && options.query) {
      expect(prompt.text).toContain(options.query);
    }

    // Length checks
    expect(prompt.text.length).toBeGreaterThan(minTextLength);
    if (shouldHaveSystemPrompt) {
      expect(prompt.systemPrompt.length).toBeGreaterThan(minSystemPromptLength);
    }

    return prompt;
  };
} catch (error) {
  console.warn('Prompt engineering module not available for testing');
}
