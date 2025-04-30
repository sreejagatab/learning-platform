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
 * Make a request to the Perplexity Sonar API with enhanced prompt engineering
 * Implements advanced domain detection and specialized templates
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
    if (promptEngineering.config.debugMode) {
      logger.debug('Using optimized prompt:', JSON.stringify(enhancedPrompt, null, 2));
    } else {
      logger.debug('Using optimized prompt for query:', query);
    }

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

    // Adjust temperature based on query complexity and content type
    let adjustedTemperature = requestOptions.temperature;
    const contentType = promptEngineering.analyzeQueryIntent(query).contentType;

    // Lower temperature for factual queries, higher for creative ones
    if (contentType === 'definition' || contentType === 'explanation') {
      adjustedTemperature = Math.max(0.3, adjustedTemperature - 0.2);
    } else if (contentType === 'analysis' || contentType === 'synthesis') {
      adjustedTemperature = Math.min(0.8, adjustedTemperature + 0.1);
    }

    // Make request to Perplexity API
    const response = await axios.post(
      `${PERPLEXITY_API_URL}/v1/chat/completions`,
      {
        messages,
        model: requestOptions.model,
        max_tokens: requestOptions.max_tokens,
        temperature: adjustedTemperature,
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
 * Ask a follow-up question with enhanced context retention
 * Implements advanced prompt engineering for improved contextual understanding
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

    // Enhance userContext with previous messages for better context retention
    const enhancedUserContext = {
      ...userContext,
      previousMessages: previousMessages
    };

    // Generate optimized follow-up prompt with enhanced context retention
    const enhancedPrompt = promptEngineering.generateFollowUpPrompt(followUpQuery, enhancedUserContext);

    // Log the optimized prompt for debugging
    if (promptEngineering.config.debugMode) {
      logger.debug('Using optimized follow-up prompt:', JSON.stringify(enhancedPrompt, null, 2));
    } else {
      logger.debug('Using optimized follow-up prompt for query:', followUpQuery);
    }

    // Prepare messages array
    let messages = [];

    // Add system message if we have a system prompt
    if (enhancedPrompt.systemPrompt) {
      messages.push({
        role: 'system',
        content: enhancedPrompt.systemPrompt
      });
    }

    // Process previous messages to improve context retention
    const processedMessages = previousMessages.map(msg => {
      // If this is a system message, we might want to replace it with our enhanced system prompt
      if (msg.role === 'system' && enhancedPrompt.systemPrompt) {
        return null; // Skip old system messages when we have an enhanced one
      }
      return msg;
    }).filter(Boolean); // Remove null entries

    // Add previous messages for context
    messages = [
      ...messages,
      ...processedMessages,
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
        include_citations: true,
        context: userContext.previousContext || [] // For maintaining conversation context
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
 * Generate a curated learning path on a topic with enhanced prompt engineering
 * Implements advanced templates for more structured and comprehensive learning paths
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

    // Generate optimized learning path prompt using our enhanced prompt engineering system
    const enhancedPrompt = promptEngineering.generateLearningPathOptimizedPrompt(topic, userContext);

    // Log the optimized prompt for debugging
    if (promptEngineering.config.debugMode) {
      logger.debug('Using optimized learning path prompt:', JSON.stringify(enhancedPrompt, null, 2));
    } else {
      logger.debug('Using optimized learning path prompt for topic:', topic);
    }

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

      // Detect domain for better learning path structure
      const domainTemplate = promptEngineering.advancedPrompts.detectDomainEnhanced(topic);
      const domainSpecificOptions = {};

      // Adjust parameters based on domain
      if (domainTemplate) {
        // For technical domains, use lower temperature for more precise content
        if (['computerScience', 'mathematics', 'technologyEngineering'].includes(domainTemplate.domain)) {
          domainSpecificOptions.temperature = 0.4;
        }
        // For humanities, allow more creative exploration
        else if (['artsHumanities', 'socialSciences'].includes(domainTemplate.domain)) {
          domainSpecificOptions.temperature = 0.6;
        }
      }

      // Make request to Perplexity API with domain-specific optimizations
      const response = await axios.post(
        `${PERPLEXITY_API_URL}/v1/chat/completions`,
        {
          messages,
          model: 'sonar-reasoning-pro',
          max_tokens: 4096, // Increase token limit for learning paths
          temperature: domainSpecificOptions.temperature || 0.5, // Domain-specific or default temperature
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

/**
 * Generate prerequisites for a topic
 * Uses advanced prompt engineering to identify necessary prerequisites
 * In development mode with no API key, returns mock data
 *
 * @param {String} topic - Main topic to identify prerequisites for
 * @param {String} level - User's knowledge level
 * @returns {Object} Structured prerequisites with importance levels
 */
const generatePrerequisites = async (topic, level = 'intermediate') => {
  try {
    // Use mock data in development mode if configured
    if (USE_MOCK_DATA && mockData) {
      logger.info(`Using mock data for prerequisites on topic: ${topic}`);

      // Simulate network delay for more realistic behavior
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Return mock prerequisites
      return {
        content: `## Prerequisites for ${topic}\n\n- Basic understanding of ${topic} fundamentals (required)\n- Familiarity with related concepts (recommended)\n- Experience with practical applications (optional)`,
        citations: [],
        timestamp: new Date().toISOString()
      };
    }

    // Generate optimized prerequisite prompt
    const enhancedPrompt = {
      text: `Identify the essential prerequisites for learning about ${topic} at a ${level} level. Format your response as a markdown list with each prerequisite marked as (required), (recommended), or (optional).`,
      systemPrompt: `You are an educational assistant helping to identify prerequisites for learning topics. Provide a concise, well-structured list of prerequisites that would help someone prepare to learn about the requested topic at the specified level. For each prerequisite, indicate whether it's required, recommended, or optional.`
    };

    // Prepare messages array
    const messages = [];

    // Add system message
    if (enhancedPrompt.systemPrompt) {
      messages.push({
        role: 'system',
        content: enhancedPrompt.systemPrompt
      });
    }

    // Add user message
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
        max_tokens: 1024,
        temperature: 0.4, // Lower temperature for more precise prerequisites
        follow_ups: false,
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
    logger.error(`Error generating prerequisites: ${error.message}`);

    // If in development mode and API call failed, use mock data as fallback
    if (process.env.NODE_ENV === 'development') {
      logger.info(`Falling back to mock data for prerequisites on topic: ${topic}`);

      return {
        content: `## Prerequisites for ${topic}\n\n- Basic understanding of ${topic} fundamentals (required)\n- Familiarity with related concepts (recommended)\n- Experience with practical applications (optional)`,
        citations: [],
        timestamp: new Date().toISOString()
      };
    }

    throw new Error(`Failed to generate prerequisites: ${error.message}`);
  }
};

/**
 * Generate content for a branch in a learning path
 * Uses advanced prompt engineering to create specialized branch content
 * In development mode with no API key, returns mock data
 *
 * @param {String} topic - Main topic of the branch
 * @param {String} branchName - Name of the branch
 * @param {Object} context - Additional context (level, mainPathTopic, etc.)
 * @returns {Object} Structured branch content
 */
const generateBranchContent = async (topic, branchName, context = {}) => {
  try {
    // Use mock data in development mode if configured
    if (USE_MOCK_DATA && mockData) {
      logger.info(`Using mock data for branch content on topic: ${topic}, branch: ${branchName}`);

      // Simulate network delay for more realistic behavior
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Return mock branch content
      return {
        content: `## ${branchName}\n\n### Overview\nThis branch focuses on ${branchName} in the context of ${topic}.\n\n### Learning Journey\n\n#### Stage 1: Introduction to ${branchName}\n- Basic concepts of ${branchName}\n- History and evolution of ${branchName}\n\n#### Stage 2: Advanced ${branchName}\n- Advanced techniques in ${branchName}\n- Practical applications of ${branchName}`,
        citations: [],
        timestamp: new Date().toISOString()
      };
    }

    const { level = 'intermediate', mainPathTopic = topic } = context;

    // Generate optimized branch content prompt
    const enhancedPrompt = {
      text: `Create a specialized learning path branch focused on "${branchName}" in the context of ${topic}. This branch is part of a larger learning path about ${mainPathTopic} at a ${level} level. Format your response as a structured markdown document with clear sections and learning stages.`,
      systemPrompt: `You are an educational assistant creating a specialized branch for a learning path. Create a well-structured, focused branch that explores "${branchName}" in depth, while maintaining relevance to the main topic. Include 3-5 learning stages with specific subtopics for each stage. Format the content as a markdown document with clear headings and bullet points for each subtopic.`
    };

    // Prepare messages array
    const messages = [];

    // Add system message
    if (enhancedPrompt.systemPrompt) {
      messages.push({
        role: 'system',
        content: enhancedPrompt.systemPrompt
      });
    }

    // Add user message
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
        max_tokens: 2048,
        temperature: 0.5,
        follow_ups: false,
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
    logger.error(`Error generating branch content: ${error.message}`);

    // If in development mode and API call failed, use mock data as fallback
    if (process.env.NODE_ENV === 'development') {
      logger.info(`Falling back to mock data for branch content on topic: ${topic}, branch: ${branchName}`);

      return {
        content: `## ${branchName}\n\n### Overview\nThis branch focuses on ${branchName} in the context of ${topic}.\n\n### Learning Journey\n\n#### Stage 1: Introduction to ${branchName}\n- Basic concepts of ${branchName}\n- History and evolution of ${branchName}\n\n#### Stage 2: Advanced ${branchName}\n- Advanced techniques in ${branchName}\n- Practical applications of ${branchName}`,
        citations: [],
        timestamp: new Date().toISOString()
      };
    }

    throw new Error(`Failed to generate branch content: ${error.message}`);
  }
};

/**
 * Process a batch of related queries efficiently
 * Uses advanced prompt engineering to optimize batch processing
 *
 * @param {Array} queries - Array of query objects with text and context
 * @param {Object} options - Batch processing options
 * @returns {Array} Array of responses corresponding to the queries
 */
const processBatchQueries = async (queries, options = {}) => {
  try {
    // Check if batch processing is enabled in config
    const batchConfig = promptEngineering.config.batchProcessing || {};
    if (!batchConfig.enableBatchProcessing) {
      // If batch processing is disabled, process queries individually
      logger.info('Batch processing is disabled, processing queries individually');
      const results = [];
      for (const query of queries) {
        const result = await querySonarAPI(query.text, query.context, query.options);
        results.push(result);
      }
      return results;
    }

    // Use mock data in development mode if configured
    if (USE_MOCK_DATA && mockData) {
      logger.info(`Using mock data for batch processing ${queries.length} queries`);

      // Simulate network delay for more realistic behavior
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate mock responses for each query
      return queries.map(query => {
        return mockData.getMockResponse(query.text, query.context?.level);
      });
    }

    // Check for result caching
    if (batchConfig.enableResultCaching) {
      // Implement a simple in-memory cache
      // In a production environment, this would use Redis or another caching solution
      const cachedResults = [];
      const uncachedQueries = [];
      const uncachedIndices = [];

      // Check cache for each query
      queries.forEach((query, index) => {
        const cacheKey = `${query.text}-${JSON.stringify(query.context || {})}-${JSON.stringify(query.options || {})}`;
        if (queryCache.has(cacheKey) &&
            (Date.now() - queryCache.get(cacheKey).timestamp) < (batchConfig.maxCacheLifetimeSeconds * 1000)) {
          cachedResults[index] = queryCache.get(cacheKey).result;
        } else {
          uncachedQueries.push(query);
          uncachedIndices.push(index);
        }
      });

      // If all results are cached, return them
      if (uncachedQueries.length === 0) {
        logger.info('All batch queries found in cache');
        return cachedResults;
      }

      // Process uncached queries
      logger.info(`Processing ${uncachedQueries.length} uncached queries out of ${queries.length} total`);

      // Group similar queries for batch processing
      const queryGroups = groupSimilarQueries(uncachedQueries, batchConfig.minSimilarityThreshold);

      // Process each group
      const uncachedResults = [];
      for (const group of queryGroups) {
        if (group.length === 1) {
          // Process single query
          const result = await querySonarAPI(group[0].text, group[0].context, group[0].options);
          uncachedResults.push({ index: uncachedIndices[group[0].originalIndex], result });

          // Cache the result
          const cacheKey = `${group[0].text}-${JSON.stringify(group[0].context || {})}-${JSON.stringify(group[0].options || {})}`;
          queryCache.set(cacheKey, { result, timestamp: Date.now() });
        } else {
          // Process batch
          const batchResults = await processBatchGroup(group, options);

          // Store results and cache them
          batchResults.forEach((result, i) => {
            const query = group[i];
            uncachedResults.push({ index: uncachedIndices[query.originalIndex], result });

            // Cache the result
            const cacheKey = `${query.text}-${JSON.stringify(query.context || {})}-${JSON.stringify(query.options || {})}`;
            queryCache.set(cacheKey, { result, timestamp: Date.now() });
          });
        }
      }

      // Combine cached and uncached results
      const finalResults = [...cachedResults];
      uncachedResults.forEach(item => {
        finalResults[item.index] = item.result;
      });

      return finalResults;
    } else {
      // No caching, process all queries

      // Group similar queries for batch processing
      const queryGroups = groupSimilarQueries(
        queries.map((q, i) => ({ ...q, originalIndex: i })),
        batchConfig.minSimilarityThreshold
      );

      // Process each group and collect results
      const results = new Array(queries.length);

      for (const group of queryGroups) {
        if (group.length === 1) {
          // Process single query
          results[group[0].originalIndex] = await querySonarAPI(
            group[0].text,
            group[0].context,
            group[0].options
          );
        } else {
          // Process batch
          const batchResults = await processBatchGroup(group, options);

          // Store results
          batchResults.forEach((result, i) => {
            results[group[i].originalIndex] = result;
          });
        }
      }

      return results;
    }
  } catch (error) {
    logger.error(`Error processing batch queries: ${error.message}`);

    // If in development mode and API call failed, use mock data as fallback
    if (process.env.NODE_ENV === 'development') {
      logger.info(`Falling back to mock data for batch processing ${queries.length} queries`);

      return queries.map(query => {
        return {
          content: `Mock response for: ${query.text}`,
          citations: [],
          timestamp: new Date().toISOString()
        };
      });
    }

    throw new Error(`Failed to process batch queries: ${error.message}`);
  }
};

/**
 * Group similar queries for efficient batch processing
 *
 * @param {Array} queries - Array of query objects
 * @param {Number} similarityThreshold - Minimum similarity threshold
 * @returns {Array} Array of query groups
 */
const groupSimilarQueries = (queries, similarityThreshold = 0.7) => {
  // In a production environment, this would use a more sophisticated
  // similarity algorithm, possibly with embeddings

  // Simple implementation for demonstration
  const groups = [];
  const remainingQueries = [...queries];

  while (remainingQueries.length > 0) {
    const currentGroup = [remainingQueries.shift()];

    // Find similar queries
    for (let i = remainingQueries.length - 1; i >= 0; i--) {
      // Simple word overlap similarity
      const baseQuery = currentGroup[0].text.toLowerCase();
      const candidateQuery = remainingQueries[i].text.toLowerCase();

      const baseWords = new Set(baseQuery.split(/\s+/));
      const candidateWords = candidateQuery.split(/\s+/);

      let matchCount = 0;
      for (const word of candidateWords) {
        if (baseWords.has(word)) {
          matchCount++;
        }
      }

      const similarity = matchCount / Math.max(baseWords.size, candidateWords.length);

      // If similar enough and same level, add to group
      if (similarity >= similarityThreshold &&
          currentGroup[0].context?.level === remainingQueries[i].context?.level) {
        currentGroup.push(remainingQueries.splice(i, 1)[0]);
      }
    }

    groups.push(currentGroup);
  }

  return groups;
};

/**
 * Process a group of similar queries as a batch
 *
 * @param {Array} queryGroup - Group of similar queries
 * @param {Object} options - Processing options
 * @returns {Array} Array of responses
 */
const processBatchGroup = async (queryGroup, options = {}) => {
  // Limit batch size according to config
  const batchConfig = promptEngineering.config.batchProcessing || {};
  const maxBatchSize = batchConfig.maxBatchSize || 5;

  if (queryGroup.length > maxBatchSize) {
    logger.info(`Batch size ${queryGroup.length} exceeds maximum ${maxBatchSize}, splitting into smaller batches`);

    // Split into smaller batches
    const results = [];
    for (let i = 0; i < queryGroup.length; i += maxBatchSize) {
      const batch = queryGroup.slice(i, i + maxBatchSize);
      const batchResults = await processBatchGroup(batch, options);
      results.push(...batchResults);
    }

    return results;
  }

  // Create a combined prompt for the batch
  const combinedPrompt = {
    text: `Please answer the following related questions:\n\n${
      queryGroup.map((q, i) => `Question ${i+1}: ${q.text}`).join('\n\n')
    }\n\nProvide a separate answer for each question, clearly labeled as "Answer 1:", "Answer 2:", etc.`,
    systemPrompt: `You are an educational assistant answering a batch of related questions. Provide a separate, comprehensive answer for each question. Maintain consistent quality and depth across all answers. Format your response with clear "Answer 1:", "Answer 2:", etc. labels to separate the responses.`
  };

  // Use the level from the first query for consistency
  const level = queryGroup[0].context?.level || 'intermediate';

  // Prepare messages array
  const messages = [];

  // Add system message
  if (combinedPrompt.systemPrompt) {
    messages.push({
      role: 'system',
      content: combinedPrompt.systemPrompt
    });
  }

  // Add user message
  messages.push({
    role: 'user',
    content: combinedPrompt.text
  });

  // Make request to Perplexity API
  const response = await axios.post(
    `${PERPLEXITY_API_URL}/v1/chat/completions`,
    {
      messages,
      model: 'sonar-reasoning-pro',
      max_tokens: 4096, // Larger token limit for batch processing
      temperature: 0.5,
      follow_ups: false,
      include_citations: true
    },
    {
      headers: {
        'Authorization': `Bearer ${SONAR_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  // Format and split the response
  const formattedResponse = formatResponse(response.data);

  // Split the combined response into individual answers
  return splitBatchResponse(formattedResponse, queryGroup.length);
};

/**
 * Split a batch response into individual answers
 *
 * @param {Object} batchResponse - Combined response from API
 * @param {Number} queryCount - Number of queries in the batch
 * @returns {Array} Array of individual responses
 */
const splitBatchResponse = (batchResponse, queryCount) => {
  const content = batchResponse.content;
  const results = [];

  // Use regex to find answer sections
  const answerPattern = /Answer\s+(\d+):([\s\S]*?)(?=Answer\s+\d+:|$)/gi;
  let match;

  while ((match = answerPattern.exec(content)) !== null) {
    const answerNumber = parseInt(match[1]);
    const answerContent = match[2].trim();

    // Store the answer at the correct index
    if (answerNumber > 0 && answerNumber <= queryCount) {
      results[answerNumber - 1] = {
        content: answerContent,
        citations: batchResponse.citations || [],
        timestamp: batchResponse.timestamp
      };
    }
  }

  // Fill in any missing answers
  for (let i = 0; i < queryCount; i++) {
    if (!results[i]) {
      results[i] = {
        content: `No specific answer was provided for question ${i+1}.`,
        citations: [],
        timestamp: batchResponse.timestamp
      };
    }
  }

  return results;
};

// Simple in-memory cache for query results
// In a production environment, this would use Redis or another caching solution
const queryCache = new Map();

module.exports = {
  querySonarAPI,
  askFollowUpQuestion,
  generateLearningPath,
  generatePrerequisites,
  generateBranchContent,
  processBatchQueries
};
