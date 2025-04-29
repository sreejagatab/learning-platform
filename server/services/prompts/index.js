/**
 * Prompt Engineering System for LearnSphere
 * This module combines various prompt templates to optimize interactions with the Perplexity Sonar API
 */

const basePrompts = require('./basePrompts');
const domainPrompts = require('./domainPrompts');
const learningPathPrompts = require('./learningPathPrompts');

/**
 * Generate an optimized educational prompt based on query, user context, and content type
 * 
 * @param {String} query - The user's original query
 * @param {Object} userContext - User's learning context and preferences
 * @param {String} contentType - Type of content being requested
 * @returns {Object} - Formatted prompt with text and system prompt
 */
const generateOptimizedPrompt = (query, userContext = {}, contentType = null) => {
  const { level = 'intermediate' } = userContext;
  
  // First, try to detect the domain and generate a domain-specific prompt
  const domainPromptComponents = domainPrompts.generateDomainPrompt(query, level);
  
  // If a specific content type is requested, use that template
  let promptComponents = domainPromptComponents;
  if (contentType && basePrompts.contentTypeTemplates[contentType]) {
    promptComponents = basePrompts.generateContentTypePrompt(query, contentType, level);
  }
  
  // Combine the components into a final prompt
  const promptText = basePrompts.combinePromptComponents(promptComponents);
  
  return {
    text: promptText,
    systemPrompt: promptComponents.systemPrompt
  };
};

/**
 * Generate an optimized learning path prompt
 * 
 * @param {String} topic - The topic to create a learning path for
 * @param {Object} userContext - User's learning context and preferences
 * @returns {Object} - Formatted prompt with text and system prompt
 */
const generateLearningPathOptimizedPrompt = (topic, userContext = {}) => {
  const { level = 'intermediate' } = userContext;
  
  // Generate learning path prompt components
  const promptComponents = learningPathPrompts.generateLearningPathPrompt(topic, level);
  
  // Combine into final prompt
  const promptText = learningPathPrompts.combineLearningPathPrompt(promptComponents);
  
  return {
    text: promptText,
    systemPrompt: promptComponents.systemPrompt
  };
};

/**
 * Generate a follow-up prompt that maintains context
 * 
 * @param {String} followUpQuery - The follow-up question
 * @param {Object} userContext - User's learning context and preferences
 * @returns {Object} - Formatted prompt with text and system prompt
 */
const generateFollowUpPrompt = (followUpQuery, userContext = {}) => {
  const { level = 'intermediate' } = userContext;
  
  // For follow-ups, we use a simpler prompt structure but maintain the level-appropriate system prompt
  const levelTemplate = basePrompts.levelTemplates[level] || basePrompts.levelTemplates.intermediate;
  
  return {
    text: followUpQuery, // For follow-ups, we send the query directly since context is maintained by message history
    systemPrompt: levelTemplate.systemPrompt
  };
};

/**
 * Analyze a query to determine the likely intent and content type
 * 
 * @param {String} query - The user's original query
 * @returns {Object} - Detected content type and domain
 */
const analyzeQueryIntent = (query) => {
  const lowerQuery = query.toLowerCase();
  
  // Detect if this is a "how to" query
  if (lowerQuery.startsWith('how to') || lowerQuery.includes('steps to') || lowerQuery.includes('guide for')) {
    return { contentType: 'howTo' };
  }
  
  // Detect if this is a comparison query
  if (lowerQuery.includes(' vs ') || lowerQuery.includes('compare') || lowerQuery.includes('difference between')) {
    return { contentType: 'comparison' };
  }
  
  // Detect if this is a definition query
  if (lowerQuery.startsWith('what is') || lowerQuery.startsWith('define') || lowerQuery.includes('meaning of')) {
    return { contentType: 'definition' };
  }
  
  // Detect if this is an analysis query
  if (lowerQuery.includes('analyze') || lowerQuery.includes('examine') || lowerQuery.includes('evaluate')) {
    return { contentType: 'analysis' };
  }
  
  // Default to explanation
  return { contentType: 'explanation' };
};

module.exports = {
  generateOptimizedPrompt,
  generateLearningPathOptimizedPrompt,
  generateFollowUpPrompt,
  analyzeQueryIntent,
  basePrompts,
  domainPrompts,
  learningPathPrompts
};
