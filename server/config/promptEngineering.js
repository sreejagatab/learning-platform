/**
 * Configuration for the Prompt Engineering System
 * Controls the behavior of the prompt engineering features
 * Enhanced with batch processing and advanced optimization settings
 */
module.exports = {
  // Use advanced prompt engineering with domain-specific templates
  useAdvancedPrompts: true,

  // Enable enhanced context retention for follow-up questions
  useContextRetention: true,

  // Enable debug mode to log detailed prompt engineering decisions
  debugMode: process.env.NODE_ENV === 'development',

  // Domain detection settings
  domainDetection: {
    // Minimum score threshold for domain detection
    minScoreThreshold: 1.0,

    // Enable fuzzy matching for domain keywords
    enableFuzzyMatching: true,

    // Weight multiplier for exact matches
    exactMatchWeight: 2.0,

    // Weight multiplier for partial matches
    partialMatchWeight: 0.5,

    // Enable multi-domain detection for interdisciplinary topics
    enableMultiDomainDetection: true,

    // Maximum number of domains to consider for multi-domain topics
    maxDomainsPerQuery: 3
  },

  // Content type detection settings
  contentTypeDetection: {
    // Default content type when no specific type is detected
    defaultType: 'explanation',

    // Minimum confidence threshold for content type detection
    minConfidenceThreshold: 0.6,

    // Enable hybrid content type detection (combining multiple types)
    enableHybridContentTypes: true,

    // Maximum number of content types to combine in hybrid mode
    maxContentTypesPerQuery: 2
  },

  // System prompt settings
  systemPrompts: {
    // Maximum length for system prompts
    maxLength: 2048,

    // Include educational best practices in system prompts
    includeBestPractices: true,

    // Include level-specific guidance in system prompts
    includeLevelGuidance: true,

    // Enable dynamic system prompt adjustment based on response quality
    enableDynamicAdjustment: true,

    // Enable specialized system prompts for different educational contexts
    useSpecializedContexts: true
  },

  // Follow-up question settings
  followUpQuestions: {
    // Maximum number of previous messages to consider for context
    maxPreviousMessages: 10,

    // Enable follow-up type detection
    enableTypeDetection: true,

    // Enable system prompt enhancement for follow-ups
    enhanceSystemPrompt: true,

    // Enable advanced context tracking for multi-turn conversations
    enableAdvancedContextTracking: true,

    // Enable concept linking between related questions
    enableConceptLinking: true
  },

  // Batch processing settings
  batchProcessing: {
    // Enable batch processing for related queries
    enableBatchProcessing: true,

    // Maximum number of queries to process in a single batch
    maxBatchSize: 5,

    // Minimum similarity threshold for including queries in the same batch
    minSimilarityThreshold: 0.7,

    // Enable result caching for batch-processed queries
    enableResultCaching: true,

    // Maximum cache lifetime in seconds
    maxCacheLifetimeSeconds: 3600
  },

  // Template optimization settings
  templateOptimization: {
    // Enable automatic template selection based on query characteristics
    enableAutoTemplateSelection: true,

    // Enable template performance tracking
    trackTemplatePerformance: true,

    // Enable template adaptation based on performance metrics
    enableTemplateAdaptation: true,

    // Minimum number of uses before adapting a template
    minUsesBeforeAdaptation: 10
  }
};
