# Prompt Engineering System for LearnSphere

This directory contains the prompt engineering system for LearnSphere, which optimizes interactions with the Perplexity Sonar API to provide high-quality educational responses.

## Overview

The prompt engineering system uses a modular approach to generate optimized prompts for different educational contexts, domains, and user knowledge levels. It consists of several components:

- **Base Prompts**: Core templates for different user levels and content types
- **Domain Prompts**: Specialized templates for different educational domains (e.g., computer science, mathematics, etc.)
- **Learning Path Prompts**: Structured templates for generating comprehensive learning paths

## Files

- `index.js`: Main entry point that combines all prompt templates
- `basePrompts.js`: Base templates for different user levels and content types
- `domainPrompts.js`: Domain-specific templates and detection logic
- `learningPathPrompts.js`: Templates for generating structured learning paths

## Usage

The prompt engineering system is used by the Perplexity service to generate optimized prompts for different types of educational queries:

```javascript
// Generate an optimized educational prompt
const enhancedPrompt = promptEngineering.generateOptimizedPrompt(query, userContext, contentType);

// Generate a learning path prompt
const learningPathPrompt = promptEngineering.generateLearningPathOptimizedPrompt(topic, userContext);

// Generate a follow-up prompt
const followUpPrompt = promptEngineering.generateFollowUpPrompt(followUpQuery, userContext);
```

## Features

### 1. User Level Adaptation

Prompts are tailored to the user's knowledge level:

- **Beginner**: Simple explanations with minimal jargon
- **Intermediate**: Comprehensive explanations with balanced depth
- **Advanced**: In-depth analysis with technical details

### 2. Domain-Specific Optimization

The system detects the domain of the query and applies specialized templates for:

- Computer Science & Programming
- Mathematics
- Natural Sciences
- Social Sciences
- Arts & Humanities
- Health & Medicine
- Business & Economics
- Technology & Engineering
- Languages & Linguistics

### 3. Content Type Optimization

Different types of educational content are handled with specialized templates:

- Explanations
- Comparisons
- How-to guides
- Analysis
- Definitions

### 4. Learning Path Structure

Learning paths are generated with a structured format based on the user's level:

- Beginner paths focus on fundamentals and practical understanding
- Intermediate paths balance theory with application
- Advanced paths emphasize depth, research, and mastery

## Extending the System

To add new templates or domains:

1. Add new templates to the appropriate file
2. Update the detection logic if needed
3. The system will automatically use the new templates

## Benefits

This prompt engineering system provides several benefits:

- **Improved Response Quality**: More relevant and educational responses
- **Consistent Structure**: Standardized format for different types of content
- **Domain Expertise**: Specialized knowledge for different educational fields
- **Personalization**: Adaptation to the user's knowledge level
