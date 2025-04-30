# Enhanced Prompt Engineering System for LearnSphere

This directory contains the enhanced prompt engineering system for LearnSphere, which optimizes interactions with the Perplexity Sonar API to provide high-quality educational responses.

## Overview

The prompt engineering system uses a sophisticated approach to generate optimized prompts for different educational contexts, domains, and user knowledge levels. It consists of several components:

- **Base Prompts**: Core templates for different user levels and content types
- **Domain Prompts**: Specialized templates for different educational domains
- **Learning Path Prompts**: Structured templates for generating comprehensive learning paths
- **Advanced Prompts**: Enhanced templates with more detailed instructions and better domain detection

## Files

- `index.js`: Main entry point that combines all prompt templates
- `basePrompts.js`: Base templates for different user levels and content types
- `domainPrompts.js`: Domain-specific templates and detection logic
- `learningPathPrompts.js`: Templates for generating structured learning paths
- `advancedPrompts.js`: Enhanced templates with more sophisticated instructions

## Configuration

The prompt engineering system can be configured through `server/config/promptEngineering.js`, which allows for:

- Enabling/disabling advanced features
- Adjusting domain detection parameters
- Setting content type detection thresholds
- Configuring system prompt behavior
- Tuning follow-up question handling

## Usage

The prompt engineering system is used by the Perplexity service to generate optimized prompts for different types of educational queries:

```javascript
// Generate an optimized educational prompt
const enhancedPrompt = promptEngineering.generateOptimizedPrompt(query, userContext, contentType);

// Generate a learning path prompt
const learningPathPrompt = promptEngineering.generateLearningPathOptimizedPrompt(topic, userContext);

// Generate a follow-up prompt with enhanced context retention
const followUpPrompt = promptEngineering.generateFollowUpPrompt(followUpQuery, enhancedUserContext);

// Configure the prompt engineering system
const currentConfig = promptEngineering.configurePromptEngineering({
  useAdvancedPrompts: true,
  useContextRetention: true,
  debugMode: false
});
```

## Key Features

### 1. Advanced User Level Adaptation

Prompts are tailored to the user's knowledge level with detailed instructions:

- **Beginner**: Simple explanations with everyday analogies and minimal jargon
- **Intermediate**: Balanced depth with field-specific terminology and connections to existing knowledge
- **Advanced**: Sophisticated explanations with precise terminology and cutting-edge developments
- **Expert**: Highly technical information with references to recent research and methodological considerations

### 2. Enhanced Domain Detection

The system uses a weighted keyword matching algorithm to detect the domain of a query:

- Computer Science & Programming (expanded keyword set)
- Mathematics (with specialized sub-domains)
- Natural Sciences (physics, chemistry, biology, etc.)
- Social Sciences (psychology, sociology, economics, etc.)
- Arts & Humanities (literature, philosophy, art, etc.)
- Health & Medicine (with medical specialties)
- Business & Economics (with business functions)
- Technology & Engineering (with engineering disciplines)

### 3. Expanded Content Type Detection

More sophisticated detection of educational content types:

- Explanations (comprehensive with key principles)
- Comparisons (structured with clear categories)
- How-to guides (step-by-step with troubleshooting)
- Analysis (multiple perspectives and frameworks)
- Definitions (formal, contextual, and historical)
- Evaluations (strengths, weaknesses, and balanced judgment)
- Synthesis (integration of current understanding)

### 4. Improved Context Retention

For follow-up questions, the system:

- Analyzes the type of follow-up (clarification, deepening, application, connection)
- Maintains context from previous messages
- Provides specific instructions for maintaining continuity

### 5. Dynamic Parameter Adjustment

The system dynamically adjusts API parameters based on:

- Query complexity
- Domain
- Content type
- User level

### 6. Enhanced Learning Path Structure

Learning paths are generated with a more sophisticated structure:

- Beginner paths focus on fundamentals with concrete examples and practical applications
- Intermediate paths balance theory with application and include resources for deeper exploration
- Advanced paths emphasize depth, current research, and specialized methodologies
- All paths include clear prerequisites, logical progression, and appropriate resources

## Extending the System

To add new domains or content types:

1. Add new templates to the appropriate files
2. Update the detection logic in `analyzeQueryIntent` or `detectDomainEnhanced`
3. Add any necessary configuration parameters to `promptEngineering.js`
4. The system will automatically use the new templates based on the detection logic

## Performance Considerations

- Domain detection uses weighted keyword matching, which is efficient but may need tuning for specific use cases
- System prompts are designed to be comprehensive but should be kept under 2048 tokens
- Context retention for follow-ups maintains a balance between completeness and token efficiency
- Configuration options allow for fine-tuning the system based on performance requirements

## Benefits

This enhanced prompt engineering system provides several benefits:

- **Improved Response Quality**: More relevant, accurate, and educational responses
- **Consistent Structure**: Standardized format for different types of content
- **Domain Expertise**: Specialized knowledge for different educational fields
- **Personalization**: Sophisticated adaptation to the user's knowledge level
- **Better Context Retention**: More coherent follow-up responses
- **Optimized API Usage**: Dynamic parameter adjustment for better results
- **Configurability**: Flexible system that can be tuned for different use cases
- **Extensibility**: Easy to add new domains, content types, and features
