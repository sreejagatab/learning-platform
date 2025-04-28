/**
 * Service for interacting with Perplexity's Sonar API
 */
const axios = require('axios');
const config = require('config');
const logger = require('../utils/logger');

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
 * 
 * @param {String} query - User's original query
 * @param {Object} userContext - User's learning context, preferences and level
 * @returns {String} - Enhanced query for better educational responses
 */
const generateEducationalPrompt = (query, userContext = {}) => {
  const { level = 'intermediate', preferences = {} } = userContext;
  
  // Tailor prompt based on user's learning level
  let promptPrefix = '';
  
  switch (level) {
    case 'beginner':
      promptPrefix = 'Explain in simple terms, as if to someone new to this topic: ';
      break;
    case 'intermediate':
      promptPrefix = 'Provide a comprehensive explanation of: ';
      break;
    case 'advanced':
      promptPrefix = 'Give an in-depth, detailed analysis of: ';
      break;
    default:
      promptPrefix = 'Explain: ';
  }
  
  // Add educational focus to the prompt
  const educationalSuffix = ' Include key concepts, examples, and relevant context for learning purposes.';
  
  // Combine to create the final prompt
  return `${promptPrefix}${query}${educationalSuffix}`;
};

/**
 * Make a request to the Perplexity Sonar API
 * 
 * @param {String} query - User query
 * @param {Object} userContext - User's learning context and preferences
 * @param {Object} options - Additional options to override defaults
 * @returns {Object} Formatted response from Sonar API
 */
const querySonarAPI = async (query, userContext = {}, options = {}) => {
  try {
    // Generate educational prompt based on query and user context
    const enhancedQuery = generateEducationalPrompt(query, userContext);
    
    // Combine default options with any overrides
    const requestOptions = {
      ...defaultOptions,
      ...options
    };
    
    // Make request to Perplexity API
    const response = await axios.post(
      `${PERPLEXITY_API_URL}/v1/chat/completions`,
      {
        messages: [{ role: 'user', content: enhancedQuery }],
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
    throw new Error(`Failed to get response from Perplexity: ${error.message}`);
  }
};

/**
 * Ask a follow-up question continuing from previous context
 * 
 * @param {String} followUpQuery - The follow-up question
 * @param {Array} previousMessages - Previous messages in the conversation
 * @param {Object} userContext - User's learning context
 * @returns {Object} Formatted response to the follow-up question
 */
const askFollowUpQuestion = async (followUpQuery, previousMessages, userContext = {}) => {
  try {
    // Format previous messages for context
    const messages = [
      ...previousMessages,
      { role: 'user', content: followUpQuery }
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
    throw new Error(`Failed to get response for follow-up question: ${error.message}`);
  }
};

/**
 * Generate a curated learning path on a topic
 * 
 * @param {String} topic - Main topic to create a learning path for
 * @param {Object} userContext - User's learning preferences and level
 * @returns {Object} Structured learning path with subtopics and resources
 */
const generateLearningPath = async (topic, userContext = {}) => {
  try {
    const prompt = `Create a structured learning path for the topic: ${topic}. 
                    Include key concepts to master, recommended subtopics in logical order, 
                    and suggest relevant resources. The path should be tailored for a 
                    ${userContext.level || 'intermediate'} level learner and should help 
                    build comprehensive understanding.`;
    
    const response = await querySonarAPI(prompt, userContext, { 
      temperature: 0.5 // Lower temperature for more structured responses
    });
    
    return {
      ...response,
      topic,
      level: userContext.level || 'intermediate'
    };
  } catch (error) {
    logger.error(`Error generating learning path: ${error.message}`);
    throw new Error(`Failed to generate learning path: ${error.message}`);
  }
};

module.exports = {
  querySonarAPI,
  askFollowUpQuestion,
  generateLearningPath
};
