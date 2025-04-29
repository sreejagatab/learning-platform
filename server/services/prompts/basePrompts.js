/**
 * Base prompt templates for different educational contexts
 * These templates are designed to optimize responses from the Perplexity Sonar API
 */

// Base templates for different user levels
const levelTemplates = {
  beginner: {
    prefix: 'Explain in simple terms, as if to someone new to this topic: ',
    suffix: ' Use straightforward language, basic examples, and avoid jargon. Focus on fundamental concepts and practical applications.',
    systemPrompt: 'You are an educational assistant helping a beginner learner. Use simple explanations, avoid technical jargon, and provide basic examples to illustrate concepts. Break down complex ideas into manageable parts.'
  },
  
  intermediate: {
    prefix: 'Provide a comprehensive explanation of: ',
    suffix: ' Include key concepts, practical examples, and some theoretical background. Balance depth with accessibility.',
    systemPrompt: 'You are an educational assistant helping an intermediate learner who has some background knowledge. Provide detailed explanations with a balance of theory and practical examples. You can use some technical terminology but explain specialized concepts.'
  },
  
  advanced: {
    prefix: 'Give an in-depth, detailed analysis of: ',
    suffix: ' Include advanced concepts, theoretical frameworks, current research, and nuanced perspectives. Don\'t shy away from complexity.',
    systemPrompt: 'You are an educational assistant helping an advanced learner with strong background knowledge. Provide sophisticated analysis with technical depth, theoretical frameworks, and nuanced perspectives. Reference current research and advanced applications.'
  }
};

// Base templates for different content types
const contentTypeTemplates = {
  explanation: {
    prefix: 'Explain the concept of ',
    suffix: ' Include key principles, examples, and applications.'
  },
  
  comparison: {
    prefix: 'Compare and contrast ',
    suffix: ' Analyze similarities, differences, advantages, and limitations of each.'
  },
  
  howTo: {
    prefix: 'Provide a step-by-step guide on how to ',
    suffix: ' Include necessary prerequisites, common pitfalls, and best practices.'
  },
  
  analysis: {
    prefix: 'Analyze ',
    suffix: ' Consider different perspectives, underlying principles, and implications.'
  },
  
  definition: {
    prefix: 'Define ',
    suffix: ' Include formal definition, context, origin, and practical meaning.'
  }
};

/**
 * Generate a base educational prompt based on user level
 * 
 * @param {String} query - The user's original query
 * @param {String} level - User's knowledge level (beginner, intermediate, advanced)
 * @returns {Object} - Formatted prompt with prefix, content, suffix, and system prompt
 */
const generateBaseLevelPrompt = (query, level = 'intermediate') => {
  const template = levelTemplates[level] || levelTemplates.intermediate;
  
  return {
    prefix: template.prefix,
    content: query,
    suffix: template.suffix,
    systemPrompt: template.systemPrompt
  };
};

/**
 * Generate a content-type specific prompt
 * 
 * @param {String} query - The specific content to query about
 * @param {String} contentType - Type of content (explanation, comparison, howTo, etc.)
 * @param {String} level - User's knowledge level
 * @returns {Object} - Formatted prompt with prefix, content, suffix, and system prompt
 */
const generateContentTypePrompt = (query, contentType = 'explanation', level = 'intermediate') => {
  const levelTemplate = levelTemplates[level] || levelTemplates.intermediate;
  const typeTemplate = contentTypeTemplates[contentType] || contentTypeTemplates.explanation;
  
  return {
    prefix: typeTemplate.prefix,
    content: query,
    suffix: typeTemplate.suffix,
    systemPrompt: levelTemplate.systemPrompt
  };
};

/**
 * Combine prompt components into a final prompt string
 * 
 * @param {Object} promptComponents - Object containing prefix, content, and suffix
 * @returns {String} - Combined prompt string
 */
const combinePromptComponents = (promptComponents) => {
  const { prefix, content, suffix } = promptComponents;
  return `${prefix}${content}${suffix}`;
};

module.exports = {
  levelTemplates,
  contentTypeTemplates,
  generateBaseLevelPrompt,
  generateContentTypePrompt,
  combinePromptComponents
};
