/**
 * Jest tests for the Enhanced Prompt Engineering System
 */

const promptEngineering = require('../services/prompts');
const advancedPrompts = require('../services/prompts/advancedPrompts');

describe('Prompt Engineering System', () => {
  
  describe('Configuration', () => {
    it('should have default configuration values', () => {
      expect(promptEngineering.config).toBeDefined();
      expect(typeof promptEngineering.config.useAdvancedPrompts).toBe('boolean');
      expect(typeof promptEngineering.config.useContextRetention).toBe('boolean');
    });
    
    it('should allow configuration updates', () => {
      const originalConfig = { ...promptEngineering.config };
      
      // Update configuration
      const updatedConfig = promptEngineering.configurePromptEngineering({
        useAdvancedPrompts: !originalConfig.useAdvancedPrompts,
        debugMode: true
      });
      
      expect(updatedConfig.useAdvancedPrompts).toBe(!originalConfig.useAdvancedPrompts);
      expect(updatedConfig.debugMode).toBe(true);
      
      // Reset configuration
      promptEngineering.configurePromptEngineering(originalConfig);
    });
  });
  
  describe('Content Type Detection', () => {
    it('should detect explanation queries', () => {
      const queries = [
        'Explain how photosynthesis works',
        'What is quantum computing',
        'Tell me about neural networks'
      ];
      
      queries.forEach(query => {
        const result = promptEngineering.analyzeQueryIntent(query);
        expect(result.contentType).toBe('explanation');
      });
    });
    
    it('should detect comparison queries', () => {
      const queries = [
        'Compare SQL vs NoSQL databases',
        'What is the difference between Python and JavaScript',
        'Contrast classical and quantum computing'
      ];
      
      queries.forEach(query => {
        const result = promptEngineering.analyzeQueryIntent(query);
        expect(result.contentType).toBe('comparison');
      });
    });
    
    it('should detect how-to queries', () => {
      const queries = [
        'How to build a neural network',
        'Steps to create a React application',
        'Guide for implementing binary search'
      ];
      
      queries.forEach(query => {
        const result = promptEngineering.analyzeQueryIntent(query);
        expect(result.contentType).toBe('howTo');
      });
    });
  });
  
  describe('Domain Detection', () => {
    it('should detect computer science domain', () => {
      const queries = [
        'How do sorting algorithms work',
        'Explain object-oriented programming concepts',
        'What is the difference between stack and heap memory'
      ];
      
      queries.forEach(query => {
        const domain = advancedPrompts.detectDomainEnhanced(query);
        expect(domain).toBeTruthy();
        expect(domain.domains).toEqual(
          expect.arrayContaining(['programming', 'algorithm', 'computer'].filter(Boolean))
        );
      });
    });
    
    it('should detect mathematics domain', () => {
      const queries = [
        'Explain calculus fundamentals',
        'How to solve differential equations',
        'What is linear algebra used for'
      ];
      
      queries.forEach(query => {
        const domain = advancedPrompts.detectDomainEnhanced(query);
        expect(domain).toBeTruthy();
        expect(domain.domains).toEqual(
          expect.arrayContaining(['math', 'calculus', 'algebra'].filter(Boolean))
        );
      });
    });
  });
  
  describe('Prompt Generation', () => {
    it('should generate optimized prompts for different content types', () => {
      const query = 'How do neural networks work';
      const contentTypes = ['explanation', 'howTo', 'comparison', 'analysis'];
      
      contentTypes.forEach(contentType => {
        const prompt = promptEngineering.generateOptimizedPrompt(query, { level: 'intermediate' }, contentType);
        testPromptGeneration(prompt, { query });
      });
    });
    
    it('should generate prompts for different user levels', () => {
      const query = 'Explain machine learning algorithms';
      const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
      
      levels.forEach(level => {
        const prompt = promptEngineering.generateOptimizedPrompt(query, { level });
        testPromptGeneration(prompt, { query });
      });
    });
    
    it('should generate learning path prompts', () => {
      const topic = 'Machine Learning';
      const levels = ['beginner', 'intermediate', 'advanced'];
      
      levels.forEach(level => {
        const prompt = promptEngineering.generateLearningPathOptimizedPrompt(topic, { level });
        testPromptGeneration(prompt, { query: topic });
      });
    });
    
    it('should generate follow-up prompts with context retention', () => {
      const followUpQuery = 'Can you explain that in more detail?';
      const previousMessages = [
        { role: 'user', content: 'What is machine learning?' },
        { role: 'assistant', content: 'Machine learning is a subset of artificial intelligence...' }
      ];
      
      const prompt = promptEngineering.generateFollowUpPrompt(followUpQuery, {
        level: 'intermediate',
        previousMessages
      });
      
      testPromptGeneration(prompt, { 
        query: followUpQuery,
        shouldIncludeQuery: true
      });
    });
  });
});
