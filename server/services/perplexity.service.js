/**
 * Service for interacting with Perplexity's Sonar API
 * In development mode, uses mock data when API key is not available
 * Implements advanced prompt engineering for optimized educational responses
 */
const axios = require('axios');
const config = require('config');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');
const promptEngineering = require('./prompts');

// Check if we should use mock data
const USE_MOCK_DATA = process.env.NODE_ENV === 'development' &&
                      (!process.env.SONAR_API_KEY || process.env.SONAR_API_KEY === 'dummy_api_key_for_testing');

// Import mock data if in development mode
let mockData;
if (USE_MOCK_DATA) {
  try {
    mockData = require('../mock/responses');
    logger.info('Using mock data for Perplexity API responses');
  } catch (error) {
    logger.error(`Failed to load mock data: ${error.message}`);
  }
}

// Constants
const PERPLEXITY_API_URL = process.env.PERPLEXITY_API_URL || 'https://api.perplexity.ai';
const SONAR_API_KEY = process.env.SONAR_API_KEY || config.get('sonarApiKey');

// Default options for Sonar API requests
const defaultOptions = {
  model: 'sonar-reasoning-pro', // Using Sonar Reasoning Pro for advanced features
  max_tokens: 2048,
  temperature: 0.7,
  follow_ups: true, // Enable follow-up questions
  include_citations: true // Always include citations for educational content
};

/**
 * Format a response from Perplexity Sonar API for the learning platform
 *
 * @param {Object} response - Raw API response
 * @returns {Object} Formatted response with content, citations, and follow-up questions
 */
const formatResponse = (response) => {
  try {
    const { text, citations = [], follow_ups = [] } = response;

    // Format citations for display
    const formattedCitations = citations.map(citation => ({
      id: citation.id,
      title: citation.title || 'Unknown Source',
      url: citation.url,
      snippet: citation.snippet,
      published_date: citation.published_date
    }));

    // Format follow-up questions
    const formattedFollowUps = follow_ups.map(question => question.text);

    return {
      content: text,
      citations: formattedCitations,
      followUpQuestions: formattedFollowUps,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error(`Error formatting Perplexity response: ${error.message}`);
    return {
      content: response.text || 'No content available',
      citations: [],
      followUpQuestions: [],
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Generate an educational query prompt optimized for learning
 * Uses advanced prompt engineering with domain-specific templates
 *
 * @param {String} query - User's original query
 * @param {Object} userContext - User's learning context, preferences and level
 * @returns {Object} - Enhanced prompt with text and system prompt
 */
const generateEducationalPrompt = (query, userContext = {}) => {
  // Analyze the query to determine the likely intent and content type
  const { contentType } = promptEngineering.analyzeQueryIntent(query);

  // Generate an optimized prompt using our prompt engineering system
  return promptEngineering.generateOptimizedPrompt(query, userContext, contentType);
};

/**
 * Make a request to the Perplexity Sonar API
 * In development mode with no API key, returns mock data
 *
 * @param {String} query - User query
 * @param {Object} userContext - User's learning context and preferences
 * @param {Object} options - Additional options to override defaults
 * @returns {Object} Formatted response from Sonar API or mock data
 */
const querySonarAPI = async (query, userContext = {}, options = {}) => {
  try {
    // Use mock data in development mode if configured
    if (USE_MOCK_DATA && mockData) {
      logger.info(`Using mock data for query: ${query}`);
      const mockResponse = mockData.getMockResponse(query, userContext.level);

      // Add timestamp to mock response
      mockResponse.timestamp = new Date().toISOString();

      // Simulate network delay for more realistic behavior
      await new Promise(resolve => setTimeout(resolve, 1000));

      return mockResponse;
    }

    // Generate optimized educational prompt based on query and user context
    const enhancedPrompt = generateEducationalPrompt(query, userContext);

    // Log the optimized prompt for debugging
    logger.debug('Using optimized prompt:', enhancedPrompt);

    // Combine default options with any overrides
    const requestOptions = {
      ...defaultOptions,
      ...options
    };

    // Prepare messages array with system prompt if available
    const messages = [];

    // Add system message if we have a system prompt
    if (enhancedPrompt.systemPrompt) {
      messages.push({
        role: 'system',
        content: enhancedPrompt.systemPrompt
      });
    }

    // Add user message with the enhanced prompt text
    messages.push({
      role: 'user',
      content: enhancedPrompt.text
    });

    // Make request to Perplexity API
    const response = await axios.post(
      `${PERPLEXITY_API_URL}/v1/chat/completions`,
      {
        messages,
        model: requestOptions.model,
        max_tokens: requestOptions.max_tokens,
        temperature: requestOptions.temperature,
        follow_ups: requestOptions.follow_ups,
        include_citations: requestOptions.include_citations,
        context: userContext.previousContext || [] // For maintaining conversation context
      },
      {
        headers: {
          'Authorization': `Bearer ${SONAR_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Format the response for our application
    return formatResponse(response.data);
  } catch (error) {
    logger.error(`Error querying Perplexity Sonar API: ${error.message}`);

    // If in development mode and we have mock data but API call failed, use mock data as fallback
    if (process.env.NODE_ENV === 'development' && mockData) {
      logger.info(`Falling back to mock data for query: ${query}`);
      const mockResponse = mockData.getMockResponse(query, userContext.level);
      mockResponse.timestamp = new Date().toISOString();
      return mockResponse;
    }

    throw new Error(`Failed to get response from Perplexity: ${error.message}`);
  }
};

/**
 * Ask a follow-up question continuing from previous context
 * In development mode with no API key, returns mock data
 *
 * @param {String} followUpQuery - The follow-up question
 * @param {Array} previousMessages - Previous messages in the conversation
 * @param {Object} userContext - User's learning context
 * @returns {Object} Formatted response to the follow-up question
 */
const askFollowUpQuestion = async (followUpQuery, previousMessages, userContext = {}) => {
  try {
    // Use mock data in development mode if configured
    if (USE_MOCK_DATA && mockData) {
      logger.info(`Using mock data for follow-up query: ${followUpQuery}`);
      const mockResponse = mockData.getMockResponse(followUpQuery, userContext.level);

      // Add timestamp to mock response
      mockResponse.timestamp = new Date().toISOString();

      // Simulate network delay for more realistic behavior
      await new Promise(resolve => setTimeout(resolve, 1000));

      return mockResponse;
    }

    // Generate optimized follow-up prompt
    const enhancedPrompt = promptEngineering.generateFollowUpPrompt(followUpQuery, userContext);

    // Log the optimized prompt for debugging
    logger.debug('Using optimized follow-up prompt:', enhancedPrompt);

    // Prepare messages array
    let messages = [];

    // Add system message if we have a system prompt
    if (enhancedPrompt.systemPrompt) {
      messages.push({
        role: 'system',
        content: enhancedPrompt.systemPrompt
      });
    }

    // Add previous messages for context
    messages = [
      ...messages,
      ...previousMessages,
      { role: 'user', content: enhancedPrompt.text }
    ];

    // Make request to Perplexity API with conversation history
    const response = await axios.post(
      `${PERPLEXITY_API_URL}/v1/chat/completions`,
      {
        messages,
        model: 'sonar-reasoning-pro',
        max_tokens: 2048,
        temperature: 0.7,
        follow_ups: true,
        include_citations: true
      },
      {
        headers: {
          'Authorization': `Bearer ${SONAR_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Format the response
    return formatResponse(response.data);
  } catch (error) {
    logger.error(`Error asking follow-up question: ${error.message}`);

    // If in development mode and we have mock data but API call failed, use mock data as fallback
    if (process.env.NODE_ENV === 'development' && mockData) {
      logger.info(`Falling back to mock data for follow-up query: ${followUpQuery}`);
      const mockResponse = mockData.getMockResponse(followUpQuery, userContext.level);
      mockResponse.timestamp = new Date().toISOString();
      return mockResponse;
    }

    throw new Error(`Failed to get response for follow-up question: ${error.message}`);
  }
};

/**
 * Generate a curated learning path on a topic
 * In development mode with no API key, returns mock data
 *
 * @param {String} topic - Main topic to create a learning path for
 * @param {Object} userContext - User's learning preferences and level
 * @returns {Object} Structured learning path with subtopics and resources
 */
const generateLearningPath = async (topic, userContext = {}) => {
  try {
    // Use mock data in development mode if configured
    if (USE_MOCK_DATA && mockData) {
      logger.info(`Using mock data for learning path on topic: ${topic}`);
      const mockPath = mockData.generateMockLearningPath(topic, userContext.level || 'intermediate');

      // Simulate network delay for more realistic behavior
      await new Promise(resolve => setTimeout(resolve, 1500));

      return {
        content: mockPath.content,
        citations: mockPath.citations,
        followUpQuestions: [],
        timestamp: new Date().toISOString(),
        topic,
        level: userContext.level || 'intermediate',
        pathId: mockPath.pathId
      };
    }

    // Generate optimized learning path prompt using our prompt engineering system
    const enhancedPrompt = promptEngineering.generateLearningPathOptimizedPrompt(topic, userContext);

    // Log the optimized prompt for debugging
    logger.debug('Using optimized learning path prompt:', enhancedPrompt);

    // Create a custom query function for learning paths
    const learningPathQuery = async () => {
      // Prepare messages array
      const messages = [];

      // Add system message if we have a system prompt
      if (enhancedPrompt.systemPrompt) {
        messages.push({
          role: 'system',
          content: enhancedPrompt.systemPrompt
        });
      }

      // Add user message with the enhanced prompt text
      messages.push({
        role: 'user',
        content: enhancedPrompt.text
      });

      // Make request to Perplexity API
      const response = await axios.post(
        `${PERPLEXITY_API_URL}/v1/chat/completions`,
        {
          messages,
          model: 'sonar-reasoning-pro',
          max_tokens: 4096, // Increase token limit for learning paths
          temperature: 0.5, // Lower temperature for more structured responses
          follow_ups: false, // No follow-ups needed for learning paths
          include_citations: true
        },
        {
          headers: {
            'Authorization': `Bearer ${SONAR_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return formatResponse(response.data);
    };

    // Execute the learning path query
    const response = await learningPathQuery();

    return {
      ...response,
      topic,
      level: userContext.level || 'intermediate'
    };
  } catch (error) {
    logger.error(`Error generating learning path: ${error.message}`);

    // If in development mode and we have mock data but API call failed, use mock data as fallback
    if (process.env.NODE_ENV === 'development' && mockData) {
      logger.info(`Falling back to mock data for learning path on topic: ${topic}`);
      const mockPath = mockData.generateMockLearningPath(topic, userContext.level || 'intermediate');

      return {
        content: mockPath.content,
        citations: mockPath.citations,
        followUpQuestions: [],
        timestamp: new Date().toISOString(),
        topic,
        level: userContext.level || 'intermediate',
        pathId: mockPath.pathId
      };
    }

    throw new Error(`Failed to generate learning path: ${error.message}`);
  }
};

module.exports = {
  querySonarAPI,
  askFollowUpQuestion,
  generateLearningPath
};
