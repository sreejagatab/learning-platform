/**
 * Specialized prompt templates for generating learning paths
 * These templates are designed to create structured, comprehensive learning journeys
 */

// Learning path templates for different user levels
const learningPathTemplates = {
  beginner: {
    prefix: 'Create a beginner-friendly learning path for the topic: ',
    suffix: `
    Format the learning path as follows:
    
    # Learning Path: [Topic]
    
    ## Overview
    [Provide a brief introduction to the topic and why it's valuable to learn]
    
    ## Prerequisites
    [List any foundational knowledge or skills that would be helpful]
    
    ## Learning Journey
    
    ### Stage 1: Fundamentals
    [Break down 3-4 fundamental concepts to master first]
    
    ### Stage 2: Core Concepts
    [List 4-5 essential concepts to build on the fundamentals]
    
    ### Stage 3: Practical Applications
    [Suggest 3-4 ways to apply the knowledge in real-world scenarios]
    
    ## Resources for Each Stage
    [Recommend types of resources appropriate for beginners]
    
    ## Next Steps After Completion
    [Suggest 2-3 related topics to explore next]
    
    Use simple language, avoid jargon, and focus on building a solid foundation.`,
    systemPrompt: 'You are an educational curriculum designer creating a learning path for a beginner with no prior knowledge of the subject. Focus on building a strong foundation with gradual progression. Break complex topics into manageable chunks and emphasize practical understanding over theory.'
  },
  
  intermediate: {
    prefix: 'Create a comprehensive learning path for someone with basic knowledge of: ',
    suffix: `
    Format the learning path as follows:
    
    # Learning Path: [Topic]
    
    ## Overview
    [Provide a substantive introduction to the topic, its importance, and applications]
    
    ## Prerequisites
    [List specific foundational knowledge expected and suggest resources to fill gaps]
    
    ## Learning Journey
    
    ### Stage 1: Strengthening Fundamentals
    [Identify 3-4 core concepts to review and deepen understanding]
    
    ### Stage 2: Advanced Concepts
    [Detail 5-6 more advanced concepts to master]
    
    ### Stage 3: Specialized Topics
    [Outline 4-5 specialized areas within the broader topic]
    
    ### Stage 4: Practical Implementation
    [Describe 3-4 projects or applications to reinforce learning]
    
    ## Recommended Resources
    [Suggest specific types of resources for each stage]
    
    ## Milestones and Assessments
    [Provide ways to measure progress and understanding]
    
    ## Advanced Directions
    [Suggest 3-4 paths for further specialization]
    
    Balance theoretical understanding with practical applications and provide a structured progression.`,
    systemPrompt: 'You are an educational curriculum designer creating a learning path for someone with intermediate knowledge of the subject. Build upon their existing foundation with more complex concepts and specialized topics. Balance theory with practical applications and suggest ways to deepen understanding through projects and specialized resources.'
  },
  
  advanced: {
    prefix: 'Design an advanced learning path for someone with strong knowledge of: ',
    suffix: `
    Format the learning path as follows:
    
    # Advanced Learning Path: [Topic]
    
    ## Current State of the Field
    [Provide a sophisticated overview of the current state, including recent developments and open questions]
    
    ## Knowledge Assessment
    [Outline key concepts and frameworks the learner should already understand]
    
    ## Advanced Learning Journey
    
    ### Stage 1: Cutting-Edge Concepts
    [Detail 4-5 advanced or emerging concepts in the field]
    
    ### Stage 2: Specialized Methodologies
    [Describe 4-5 advanced methodologies or techniques]
    
    ### Stage 3: Current Research Areas
    [Outline 3-4 active research areas with significant developments]
    
    ### Stage 4: Advanced Implementation
    [Suggest 2-3 sophisticated projects that integrate multiple advanced concepts]
    
    ## Expert Resources
    [Recommend academic papers, advanced textbooks, research journals, and expert communities]
    
    ## Contributing to the Field
    [Suggest ways to participate in advancing knowledge in this area]
    
    ## Interdisciplinary Connections
    [Identify 3-4 related fields where concepts intersect for broader expertise]
    
    Focus on depth, nuance, and mastery. Include theoretical frameworks and their practical applications at an advanced level.`,
    systemPrompt: 'You are an educational curriculum designer creating a learning path for someone with advanced knowledge seeking mastery of the subject. Focus on cutting-edge concepts, current research, and sophisticated applications. Emphasize depth, nuance, and interdisciplinary connections. Suggest ways to contribute to the field through research or advanced projects.'
  }
};

/**
 * Generate a specialized learning path prompt based on topic and user level
 * 
 * @param {String} topic - The topic to create a learning path for
 * @param {String} level - User's knowledge level (beginner, intermediate, advanced)
 * @returns {Object} - Formatted prompt with prefix, content, suffix, and system prompt
 */
const generateLearningPathPrompt = (topic, level = 'intermediate') => {
  const template = learningPathTemplates[level] || learningPathTemplates.intermediate;
  
  return {
    prefix: template.prefix,
    content: topic,
    suffix: template.suffix,
    systemPrompt: template.systemPrompt
  };
};

/**
 * Combine learning path prompt components into a final prompt string
 * 
 * @param {Object} promptComponents - Object containing prefix, content, and suffix
 * @returns {String} - Combined prompt string
 */
const combineLearningPathPrompt = (promptComponents) => {
  const { prefix, content, suffix } = promptComponents;
  return `${prefix}${content}${suffix}`;
};

module.exports = {
  learningPathTemplates,
  generateLearningPathPrompt,
  combineLearningPathPrompt
};
