/**
 * Domain-specific prompt templates for different educational fields
 * These templates are designed to optimize responses for specific subject areas
 */

const { levelTemplates } = require('./basePrompts');

// Domain-specific templates
const domainTemplates = {
  // Computer Science & Programming
  computerScience: {
    prefix: 'Explain the computer science concept of ',
    suffix: ' Include theoretical foundations, practical implementations, and code examples where relevant.',
    systemPrompt: 'You are a computer science educator. Provide explanations that balance theoretical concepts with practical applications. Include code examples where appropriate, using proper syntax highlighting and comments. Reference relevant algorithms, data structures, or design patterns.',
    domains: ['programming', 'coding', 'software', 'algorithm', 'data structure', 'computer', 'web development', 'database', 'network', 'cybersecurity', 'artificial intelligence', 'machine learning']
  },
  
  // Mathematics
  mathematics: {
    prefix: 'Explain the mathematical concept of ',
    suffix: ' Include formal definitions, properties, theorems, and practical applications.',
    systemPrompt: 'You are a mathematics educator. Provide clear explanations of mathematical concepts with precise definitions, relevant theorems, and step-by-step derivations. Include visual representations or examples where helpful. Balance rigor with intuitive understanding.',
    domains: ['math', 'calculus', 'algebra', 'geometry', 'statistics', 'probability', 'number theory', 'discrete mathematics', 'linear algebra', 'differential equations']
  },
  
  // Natural Sciences
  naturalSciences: {
    prefix: 'Explain the scientific concept of ',
    suffix: ' Include underlying principles, experimental evidence, and real-world applications.',
    systemPrompt: 'You are a science educator. Provide explanations grounded in the scientific method, citing empirical evidence and theoretical frameworks. Clarify how scientific concepts connect to observable phenomena and technological applications. Address common misconceptions where relevant.',
    domains: ['physics', 'chemistry', 'biology', 'astronomy', 'geology', 'environmental science', 'ecology', 'genetics', 'evolution', 'quantum', 'relativity', 'thermodynamics']
  },
  
  // Social Sciences
  socialSciences: {
    prefix: 'Explain the social science concept of ',
    suffix: ' Include theoretical frameworks, research findings, historical context, and societal implications.',
    systemPrompt: 'You are a social science educator. Provide balanced explanations that consider multiple perspectives and theoretical frameworks. Reference key studies and research findings while acknowledging methodological limitations. Connect concepts to real-world social phenomena and policy implications.',
    domains: ['psychology', 'sociology', 'anthropology', 'economics', 'political science', 'history', 'geography', 'archaeology', 'linguistics', 'education', 'communication', 'cultural studies']
  },
  
  // Arts & Humanities
  artsHumanities: {
    prefix: 'Explain the concept of ',
    suffix: ' Include historical context, key figures, influential works, and cultural significance.',
    systemPrompt: 'You are an arts and humanities educator. Provide explanations that balance factual information with interpretive analysis. Reference important works, historical contexts, and influential figures. Acknowledge diverse perspectives and cultural contexts when discussing artistic and philosophical concepts.',
    domains: ['literature', 'philosophy', 'art', 'music', 'film', 'theater', 'religion', 'ethics', 'aesthetics', 'critical theory', 'cultural studies', 'media studies']
  },
  
  // Health & Medicine
  healthMedicine: {
    prefix: 'Explain the medical concept of ',
    suffix: ' Include physiological mechanisms, clinical significance, diagnostic approaches, and treatment considerations.',
    systemPrompt: 'You are a health sciences educator. Provide accurate medical information that balances scientific detail with practical understanding. Clarify complex physiological processes and their clinical implications. Note that your explanations are educational and not a substitute for professional medical advice.',
    domains: ['medicine', 'anatomy', 'physiology', 'pathology', 'pharmacology', 'immunology', 'neuroscience', 'cardiology', 'oncology', 'pediatrics', 'surgery', 'psychiatry', 'public health', 'epidemiology']
  },
  
  // Business & Economics
  businessEconomics: {
    prefix: 'Explain the business/economic concept of ',
    suffix: ' Include theoretical frameworks, practical applications, market implications, and relevant examples.',
    systemPrompt: 'You are a business and economics educator. Provide explanations that connect theoretical principles with real-world business practices and economic phenomena. Use concrete examples from industries and markets to illustrate concepts. Consider multiple perspectives on economic theories and business strategies.',
    domains: ['business', 'economics', 'finance', 'marketing', 'management', 'accounting', 'entrepreneurship', 'macroeconomics', 'microeconomics', 'investment', 'stock market', 'monetary policy', 'fiscal policy']
  },
  
  // Technology & Engineering
  technologyEngineering: {
    prefix: 'Explain the engineering/technology concept of ',
    suffix: ' Include design principles, technical specifications, practical applications, and implementation considerations.',
    systemPrompt: 'You are an engineering and technology educator. Provide explanations that balance theoretical principles with practical applications. Include relevant equations, diagrams, or specifications where helpful. Connect concepts to real-world engineering challenges and technological innovations.',
    domains: ['engineering', 'mechanical', 'electrical', 'civil', 'chemical', 'aerospace', 'biomedical', 'robotics', 'telecommunications', 'electronics', 'materials science', 'nanotechnology', 'renewable energy']
  },
  
  // Languages & Linguistics
  languagesLinguistics: {
    prefix: 'Explain the linguistic concept of ',
    suffix: ' Include definitions, examples from different languages, theoretical frameworks, and practical applications.',
    systemPrompt: 'You are a linguistics and language educator. Provide explanations that use precise terminology while remaining accessible. Include examples from multiple languages to illustrate concepts. Balance theoretical linguistic principles with practical aspects of language learning and usage.',
    domains: ['linguistics', 'grammar', 'syntax', 'semantics', 'phonetics', 'phonology', 'morphology', 'pragmatics', 'sociolinguistics', 'historical linguistics', 'language acquisition', 'translation']
  }
};

/**
 * Detect the domain of a query based on keywords
 * 
 * @param {String} query - The user's original query
 * @returns {String} - The detected domain or null if no match
 */
const detectQueryDomain = (query) => {
  const lowerQuery = query.toLowerCase();
  
  for (const [domain, template] of Object.entries(domainTemplates)) {
    for (const keyword of template.domains) {
      if (lowerQuery.includes(keyword)) {
        return domain;
      }
    }
  }
  
  return null; // No specific domain detected
};

/**
 * Generate a domain-specific educational prompt
 * 
 * @param {String} query - The user's original query
 * @param {String} level - User's knowledge level (beginner, intermediate, advanced)
 * @returns {Object} - Formatted prompt with prefix, content, suffix, and system prompt
 */
const generateDomainPrompt = (query, level = 'intermediate') => {
  // Detect the domain from the query
  const domain = detectQueryDomain(query);
  
  // If no specific domain is detected, use the level-based template
  if (!domain) {
    const levelTemplate = levelTemplates[level] || levelTemplates.intermediate;
    return {
      prefix: levelTemplate.prefix,
      content: query,
      suffix: levelTemplate.suffix,
      systemPrompt: levelTemplate.systemPrompt
    };
  }
  
  // Get the domain-specific template
  const domainTemplate = domainTemplates[domain];
  
  // Combine domain template with level-specific system prompt
  const levelTemplate = levelTemplates[level] || levelTemplates.intermediate;
  
  return {
    prefix: domainTemplate.prefix,
    content: query,
    suffix: domainTemplate.suffix,
    systemPrompt: domainTemplate.systemPrompt
  };
};

module.exports = {
  domainTemplates,
  detectQueryDomain,
  generateDomainPrompt
};
