/**
 * Learning Path Service
 * Handles the creation, management, and adaptation of learning paths
 * Implements advanced features like adaptive learning, prerequisite mapping, and branching paths
 */
const LearningPath = require('../models/learning-path.model');
const Content = require('../models/content.model');
const perplexityService = require('./perplexity.service');
const logger = require('../utils/logger');
const mongoose = require('mongoose');
const config = require('config');

// Check if we're using mock data for development
const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true' || config.get('useMockData');
const mockStorage = require('../utils/mock-storage');

/**
 * Create a new learning path
 *
 * @param {String} topic - Main topic for the learning path
 * @param {Object} userContext - User's learning preferences and level
 * @param {String} userId - ID of the user creating the path
 * @returns {Object} - Created learning path
 */
const createLearningPath = async (topic, userContext, userId) => {
  try {
    // Generate learning path content using Perplexity service
    const generatedPath = await perplexityService.generateLearningPath(topic, userContext);

    // Parse the generated content to extract structured data
    const parsedPath = parsePathContent(generatedPath.content, topic, userContext.level);

    // Create the learning path document
    const learningPath = new LearningPath({
      title: `Learning Path: ${topic}`,
      description: parsedPath.description,
      topic,
      level: userContext.level || 'intermediate',
      user: userId,
      steps: parsedPath.steps,
      prerequisites: parsedPath.prerequisites,
      checkpoints: generateCheckpoints(parsedPath.steps),
      isAdaptive: true,
      tags: [topic, userContext.level, ...parsedPath.tags],
      branches: []
    });

    // Save the learning path
    const savedPath = await learningPath.save();

    // Also save as a content item for backward compatibility
    const contentItem = new Content({
      user: userId,
      type: 'learning_path',
      title: `Learning Path: ${topic}`,
      content: generatedPath.content,
      metadata: {
        topic,
        level: userContext.level,
        citations: generatedPath.citations,
        learningPathId: savedPath._id
      }
    });

    await contentItem.save();

    return {
      ...savedPath.toObject(),
      rawContent: generatedPath.content,
      citations: generatedPath.citations,
      contentId: contentItem._id
    };
  } catch (error) {
    logger.error(`Error creating learning path: ${error.message}`);
    throw new Error(`Failed to create learning path: ${error.message}`);
  }
};

/**
 * Parse the generated learning path content into structured data
 *
 * @param {String} content - Raw markdown content from Perplexity
 * @param {String} topic - Main topic of the learning path
 * @param {String} level - User's knowledge level
 * @returns {Object} - Structured learning path data
 */
const parsePathContent = (content, topic, level) => {
  try {
    // Default structure in case parsing fails
    const defaultPath = {
      description: `A comprehensive learning path for ${topic}.`,
      steps: [],
      prerequisites: [],
      tags: [topic, level]
    };

    // If no content, return default
    if (!content) {
      return defaultPath;
    }

    // Extract description from Overview section
    const overviewMatch = content.match(/## Overview\s+([\s\S]*?)(?=##)/);
    const description = overviewMatch ? overviewMatch[1].trim() : defaultPath.description;

    // Extract prerequisites
    const prerequisitesMatch = content.match(/## Prerequisites\s+([\s\S]*?)(?=##)/);
    const prerequisitesText = prerequisitesMatch ? prerequisitesMatch[1].trim() : '';

    // Parse prerequisites into structured format
    const prerequisites = [];
    if (prerequisitesText) {
      // Look for list items in prerequisites section
      const prereqItems = prerequisitesText.match(/- (.*)/g) || [];
      prereqItems.forEach(item => {
        const prereqText = item.replace(/- /, '').trim();
        prerequisites.push({
          topic: prereqText,
          description: prereqText,
          importance: 'recommended',
          resourceUrl: ''
        });
      });
    }

    // Extract learning journey/stages
    const stagesMatch = content.match(/## Learning Journey\s+([\s\S]*?)(?=## |$)/);
    const stagesText = stagesMatch ? stagesMatch[1].trim() : '';

    // Parse stages into steps
    const steps = [];
    let stepOrder = 1;

    // Match stage headers (### Stage X: Title)
    const stageHeaders = stagesText.match(/### Stage \d+: (.*)/g) || [];

    stageHeaders.forEach(header => {
      const stageTitle = header.replace(/### Stage \d+: /, '').trim();
      const stageIndex = stagesText.indexOf(header);
      let stageContent = '';

      // Find the content of this stage (until the next stage or end of section)
      const nextStageIndex = stagesText.indexOf('### Stage', stageIndex + 1);
      if (nextStageIndex !== -1) {
        stageContent = stagesText.substring(stageIndex + header.length, nextStageIndex).trim();
      } else {
        stageContent = stagesText.substring(stageIndex + header.length).trim();
      }

      // Extract individual topics/concepts from the stage
      const topicItems = stageContent.match(/- (.*)/g) || [];

      topicItems.forEach(item => {
        const stepTitle = item.replace(/- /, '').trim();
        steps.push({
          title: stepTitle,
          description: `Learn about ${stepTitle} as part of ${stageTitle}.`,
          content: `## ${stepTitle}\n\nThis step covers ${stepTitle} as part of the ${stageTitle} stage.`,
          order: stepOrder++,
          estimatedTimeMinutes: 30,
          resources: [],
          quiz: [],
          completed: false
        });
      });
    });

    // Extract resources if available
    const resourcesMatch = content.match(/## Resources([\s\S]*?)(?=## |$)/);
    if (resourcesMatch) {
      const resourcesText = resourcesMatch[1].trim();
      const resourceItems = resourcesText.match(/- (.*)/g) || [];

      // Distribute resources among steps
      resourceItems.forEach((item, index) => {
        const resourceText = item.replace(/- /, '').trim();
        const resourceType = determineResourceType(resourceText);

        // Add to a relevant step (distribute evenly)
        if (steps.length > 0) {
          const stepIndex = index % steps.length;
          steps[stepIndex].resources.push({
            title: resourceText,
            url: '',
            type: resourceType,
            description: resourceText
          });
        }
      });
    }

    // Extract tags
    const tags = [topic, level];
    if (stageHeaders.length > 0) {
      stageHeaders.forEach(header => {
        const stageTitle = header.replace(/### Stage \d+: /, '').trim();
        tags.push(stageTitle.toLowerCase());
      });
    }

    return {
      description,
      steps,
      prerequisites,
      tags
    };
  } catch (error) {
    logger.error(`Error parsing learning path content: ${error.message}`);
    return {
      description: `A comprehensive learning path for ${topic}.`,
      steps: [],
      prerequisites: [],
      tags: [topic, level]
    };
  }
};

/**
 * Determine the type of resource based on its description
 *
 * @param {String} resourceText - Description of the resource
 * @returns {String} - Resource type
 */
const determineResourceType = (resourceText) => {
  const lowerText = resourceText.toLowerCase();

  if (lowerText.includes('video') || lowerText.includes('youtube') || lowerText.includes('course')) {
    return 'video';
  } else if (lowerText.includes('book') || lowerText.includes('ebook')) {
    return 'book';
  } else if (lowerText.includes('tool') || lowerText.includes('software') || lowerText.includes('platform')) {
    return 'tool';
  } else {
    return 'article';
  }
};

/**
 * Generate checkpoints for a learning path
 *
 * @param {Array} steps - Array of learning path steps
 * @returns {Array} - Generated checkpoints
 */
const generateCheckpoints = (steps) => {
  if (!steps || steps.length === 0) {
    return [];
  }

  const checkpoints = [];

  // Create checkpoints after every 3-5 steps
  const checkpointInterval = steps.length <= 5 ? Math.floor(steps.length / 2) : 3;

  for (let i = checkpointInterval; i < steps.length; i += checkpointInterval) {
    checkpoints.push({
      afterStep: i,
      questions: generateCheckpointQuestions(steps.slice(i - checkpointInterval, i)),
      passingScore: 70,
      completed: false
    });
  }

  return checkpoints;
};

/**
 * Generate questions for a checkpoint based on previous steps
 *
 * @param {Array} steps - Array of steps to generate questions for
 * @returns {Array} - Generated questions
 */
const generateCheckpointQuestions = (steps) => {
  // In a real implementation, this would use AI to generate questions
  // For now, we'll create placeholder questions
  return steps.map(step => ({
    question: `What is the main concept covered in "${step.title}"?`,
    options: [
      `The core principles of ${step.title}`,
      `The history of ${step.title}`,
      `Applications of ${step.title}`,
      `Limitations of ${step.title}`
    ],
    correctAnswer: 0,
    explanation: `This question tests your understanding of the main concepts in ${step.title}.`
  }));
};

/**
 * Get a learning path by ID
 *
 * @param {String} pathId - ID of the learning path
 * @returns {Object} - Learning path data
 */
const getLearningPathById = async (pathId) => {
  try {
    const path = await LearningPath.findById(pathId);
    if (!path) {
      throw new Error('Learning path not found');
    }

    // Get the associated content item for backward compatibility
    const contentItem = await Content.findOne({
      'metadata.learningPathId': pathId
    });

    return {
      ...path.toObject(),
      rawContent: contentItem ? contentItem.content : '',
      citations: contentItem?.metadata?.citations || [],
      contentId: contentItem?._id
    };
  } catch (error) {
    logger.error(`Error getting learning path: ${error.message}`);
    throw new Error(`Failed to get learning path: ${error.message}`);
  }
};

/**
 * Update a learning path
 *
 * @param {String} pathId - ID of the learning path
 * @param {Object} updates - Updates to apply
 * @returns {Object} - Updated learning path
 */
const updateLearningPath = async (pathId, updates) => {
  try {
    const path = await LearningPath.findById(pathId);
    if (!path) {
      throw new Error('Learning path not found');
    }

    // Apply updates
    Object.keys(updates).forEach(key => {
      if (key !== '_id' && key !== 'user') {
        path[key] = updates[key];
      }
    });

    // Save the updated path
    const updatedPath = await path.save();

    // Update the associated content item if it exists
    const contentItem = await Content.findOne({
      'metadata.learningPathId': pathId
    });

    if (contentItem && updates.rawContent) {
      contentItem.content = updates.rawContent;
      contentItem.title = updatedPath.title;
      contentItem.metadata.level = updatedPath.level;
      contentItem.metadata.topic = updatedPath.topic;

      await contentItem.save();
    }

    return {
      ...updatedPath.toObject(),
      rawContent: contentItem ? contentItem.content : '',
      citations: contentItem?.metadata?.citations || [],
      contentId: contentItem?._id
    };
  } catch (error) {
    logger.error(`Error updating learning path: ${error.message}`);
    throw new Error(`Failed to update learning path: ${error.message}`);
  }
};

/**
 * Complete a step in a learning path
 *
 * @param {String} pathId - ID of the learning path
 * @param {String} stepId - ID of the step to complete
 * @returns {Object} - Updated learning path
 */
const completeStep = async (pathId, stepId) => {
  try {
    const path = await LearningPath.findById(pathId);
    if (!path) {
      throw new Error('Learning path not found');
    }

    await path.completeStep(stepId);

    // Check if a checkpoint should be taken
    const shouldTakeCheckpoint = path.shouldTakeCheckpoint();

    return {
      ...path.toObject(),
      shouldTakeCheckpoint
    };
  } catch (error) {
    logger.error(`Error completing step: ${error.message}`);
    throw new Error(`Failed to complete step: ${error.message}`);
  }
};

/**
 * Take a checkpoint in a learning path
 *
 * @param {String} pathId - ID of the learning path
 * @param {String} checkpointId - ID of the checkpoint
 * @param {Array} answers - User's answers to checkpoint questions
 * @returns {Object} - Checkpoint results and updated path
 */
const takeCheckpoint = async (pathId, checkpointId, answers) => {
  try {
    const path = await LearningPath.findById(pathId);
    if (!path) {
      throw new Error('Learning path not found');
    }

    await path.takeCheckpoint(checkpointId, answers);

    // Get the checkpoint to return results
    const checkpoint = path.checkpoints.id(checkpointId);

    return {
      checkpoint,
      path: path.toObject()
    };
  } catch (error) {
    logger.error(`Error taking checkpoint: ${error.message}`);
    throw new Error(`Failed to take checkpoint: ${error.message}`);
  }
};

/**
 * Get learning paths for a user
 *
 * @param {String} userId - ID of the user
 * @param {Object} options - Query options (limit, skip, etc.)
 * @returns {Array} - User's learning paths
 */
const getUserLearningPaths = async (userId, options = {}) => {
  try {
    const { limit = 10, skip = 0, sort = { createdAt: -1 } } = options;

    const paths = await LearningPath.find({ user: userId })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    return paths;
  } catch (error) {
    logger.error(`Error getting user learning paths: ${error.message}`);
    throw new Error(`Failed to get user learning paths: ${error.message}`);
  }
};

/**
 * Identify and suggest prerequisite topics for a learning path
 *
 * @param {String} topic - Main topic for the learning path
 * @param {String} level - User's knowledge level
 * @returns {Array} - Suggested prerequisites with importance levels
 */
const identifyPrerequisites = async (topic, level = 'intermediate') => {
  try {
    // In a production environment, this would use the Perplexity API
    // to generate prerequisites based on the topic and user level
    if (USE_MOCK_DATA) {
      // Return mock prerequisites for development
      return generateMockPrerequisites(topic, level);
    }

    // Generate prerequisites using Perplexity service
    const response = await perplexityService.generatePrerequisites(topic, level);

    // Parse and structure the prerequisites
    return parsePrerequisites(response.content, level);
  } catch (error) {
    logger.error(`Error identifying prerequisites: ${error.message}`);
    // Return basic prerequisites as fallback
    return generateMockPrerequisites(topic, level);
  }
};

/**
 * Generate mock prerequisites for development
 *
 * @param {String} topic - Main topic
 * @param {String} level - User's knowledge level
 * @returns {Array} - Mock prerequisites
 */
const generateMockPrerequisites = (topic, level) => {
  // Basic prerequisites based on level
  if (level === 'beginner') {
    return [
      {
        topic: `Fundamentals of ${topic}`,
        description: `Basic understanding of ${topic} concepts`,
        importance: 'required',
        resourceUrl: `https://example.com/learn/${topic.toLowerCase().replace(/\s+/g, '-')}/basics`
      }
    ];
  } else if (level === 'intermediate') {
    return [
      {
        topic: `Fundamentals of ${topic}`,
        description: `Solid understanding of ${topic} fundamentals`,
        importance: 'required',
        resourceUrl: `https://example.com/learn/${topic.toLowerCase().replace(/\s+/g, '-')}/fundamentals`
      },
      {
        topic: `Basic ${topic} Applications`,
        description: `Experience with basic ${topic} applications`,
        importance: 'recommended',
        resourceUrl: `https://example.com/learn/${topic.toLowerCase().replace(/\s+/g, '-')}/applications`
      }
    ];
  } else {
    // Advanced level
    return [
      {
        topic: `Advanced ${topic} Concepts`,
        description: `Strong understanding of advanced ${topic} concepts`,
        importance: 'required',
        resourceUrl: `https://example.com/learn/${topic.toLowerCase().replace(/\s+/g, '-')}/advanced`
      },
      {
        topic: `${topic} Implementation`,
        description: `Experience implementing ${topic} in real-world scenarios`,
        importance: 'required',
        resourceUrl: `https://example.com/learn/${topic.toLowerCase().replace(/\s+/g, '-')}/implementation`
      },
      {
        topic: `${topic} Best Practices`,
        description: `Familiarity with ${topic} best practices and patterns`,
        importance: 'recommended',
        resourceUrl: `https://example.com/learn/${topic.toLowerCase().replace(/\s+/g, '-')}/best-practices`
      }
    ];
  }
};

/**
 * Parse prerequisites from raw content
 *
 * @param {String} content - Raw content from Perplexity
 * @param {String} level - User's knowledge level
 * @returns {Array} - Structured prerequisites
 */
const parsePrerequisites = (content, level) => {
  try {
    const prerequisites = [];

    // Extract prerequisites section
    const prerequisitesMatch = content.match(/## Prerequisites\s+([\s\S]*?)(?=##|$)/);
    if (!prerequisitesMatch) {
      return prerequisites;
    }

    const prerequisitesText = prerequisitesMatch[1].trim();

    // Parse list items
    const prereqItems = prerequisitesText.match(/- (.*)/g) || [];

    prereqItems.forEach(item => {
      const prereqText = item.replace(/- /, '').trim();

      // Try to extract importance level if present
      let importance = 'recommended';
      let description = prereqText;

      if (prereqText.includes('(required)')) {
        importance = 'required';
        description = prereqText.replace('(required)', '').trim();
      } else if (prereqText.includes('(optional)')) {
        importance = 'optional';
        description = prereqText.replace('(optional)', '').trim();
      }

      prerequisites.push({
        topic: description,
        description: description,
        importance: importance,
        resourceUrl: ''
      });
    });

    return prerequisites;
  } catch (error) {
    logger.error(`Error parsing prerequisites: ${error.message}`);
    return [];
  }
};

/**
 * Create a branching path based on user performance or interests
 *
 * @param {String} pathId - ID of the learning path
 * @param {String} branchName - Name of the branch
 * @param {String} condition - Condition for branching (performance, interest, time, manual)
 * @param {Object} branchData - Data for the branch (topic, description, etc.)
 * @returns {Object} - Updated learning path with the new branch
 */
const createBranch = async (pathId, branchName, condition = 'manual', branchData = {}) => {
  try {
    const path = await LearningPath.findById(pathId);
    if (!path) {
      throw new Error('Learning path not found');
    }

    // Generate branch content using Perplexity service
    const { topic = path.topic, description = '', level = path.level } = branchData;

    // Create branch steps
    let branchSteps = [];

    if (USE_MOCK_DATA) {
      // Generate mock branch steps for development
      branchSteps = generateMockBranchSteps(branchName, topic, level);
    } else {
      // Generate branch content using Perplexity service
      const generatedBranch = await perplexityService.generateBranchContent(
        topic,
        branchName,
        { level, mainPathTopic: path.topic }
      );

      // Parse the generated content
      const parsedBranch = parsePathContent(generatedBranch.content, topic, level);
      branchSteps = parsedBranch.steps;
    }

    // Create the branch
    const newBranch = {
      name: branchName,
      description: description || `A specialized path focusing on ${branchName}`,
      condition,
      steps: branchSteps.map(step => step._id)
    };

    // Add the branch to the path
    path.branches.push(newBranch);

    // Add the branch steps to the path steps
    path.steps.push(...branchSteps);

    // Save the updated path
    await path.save();

    return getLearningPathById(pathId);
  } catch (error) {
    logger.error(`Error creating branch: ${error.message}`);
    throw new Error(`Failed to create branch: ${error.message}`);
  }
};

/**
 * Generate mock branch steps for development
 *
 * @param {String} branchName - Name of the branch
 * @param {String} topic - Topic of the branch
 * @param {String} level - User's knowledge level
 * @returns {Array} - Mock branch steps
 */
const generateMockBranchSteps = (branchName, topic, level) => {
  const steps = [];
  const stepCount = level === 'beginner' ? 3 : (level === 'intermediate' ? 4 : 5);

  for (let i = 1; i <= stepCount; i++) {
    steps.push({
      title: `${branchName} - Step ${i}`,
      description: `Learn about ${branchName} in the context of ${topic}`,
      content: `## ${branchName} - Step ${i}\n\nThis step covers important aspects of ${branchName} related to ${topic}.`,
      order: i,
      estimatedTimeMinutes: 30,
      resources: [],
      quiz: [],
      completed: false
    });
  }

  return steps;
};

/**
 * Adapt a learning path based on user performance
 *
 * @param {String} pathId - ID of the learning path
 * @param {Object} performanceData - User performance data
 * @returns {Object} - Updated learning path
 */
const adaptPathBasedOnPerformance = async (pathId, performanceData) => {
  try {
    const path = await LearningPath.findById(pathId);
    if (!path) {
      throw new Error('Learning path not found');
    }

    // Only adapt if the path is marked as adaptive
    if (!path.isAdaptive) {
      return path;
    }

    const { checkpointId, score, areas = [] } = performanceData;

    // Find the checkpoint
    const checkpoint = path.checkpoints.id(checkpointId);
    if (!checkpoint) {
      throw new Error('Checkpoint not found');
    }

    // If score is below passing, add remedial content
    if (score < checkpoint.passingScore) {
      // Add remedial steps based on the areas that need improvement
      await addRemedialContent(path, checkpoint, areas);
    } else if (score > 90) {
      // If score is very high, offer advanced content
      await addAdvancedContent(path, checkpoint);
    }

    // Save the updated path
    await path.save();

    return getLearningPathById(pathId);
  } catch (error) {
    logger.error(`Error adapting path: ${error.message}`);
    throw new Error(`Failed to adapt path: ${error.message}`);
  }
};

/**
 * Add remedial content to a learning path
 *
 * @param {Object} path - Learning path document
 * @param {Object} checkpoint - Checkpoint that was failed
 * @param {Array} areas - Areas that need improvement
 * @returns {Object} - Updated path
 */
const addRemedialContent = async (path, checkpoint, areas) => {
  // Find the steps before this checkpoint
  const stepsBefore = path.steps.filter(step =>
    step.order <= checkpoint.afterStep
  );

  // Create remedial steps
  const remedialSteps = [];

  // If specific areas are provided, create targeted remedial content
  if (areas && areas.length > 0) {
    for (const area of areas) {
      const remedialStep = {
        title: `Review: ${area}`,
        description: `Additional practice and review of ${area}`,
        content: `## Review: ${area}\n\nThis step provides additional explanation and practice for ${area}, which was identified as an area needing improvement.`,
        order: checkpoint.afterStep + 0.1, // Insert after the checkpoint
        estimatedTimeMinutes: 20,
        resources: [],
        quiz: [],
        completed: false
      };

      remedialSteps.push(remedialStep);
    }
  } else {
    // Create a general review step
    const remedialStep = {
      title: `Checkpoint Review`,
      description: `Review of key concepts from previous sections`,
      content: `## Checkpoint Review\n\nThis step provides a comprehensive review of the key concepts covered in the previous sections.`,
      order: checkpoint.afterStep + 0.1,
      estimatedTimeMinutes: 30,
      resources: [],
      quiz: [],
      completed: false
    };

    remedialSteps.push(remedialStep);
  }

  // Add the remedial steps to the path
  path.steps.push(...remedialSteps);

  // Re-order steps
  path.steps.sort((a, b) => a.order - b.order);

  return path;
};

/**
 * Add advanced content to a learning path
 *
 * @param {Object} path - Learning path document
 * @param {Object} checkpoint - Checkpoint that was passed with high score
 * @returns {Object} - Updated path
 */
const addAdvancedContent = async (path, checkpoint) => {
  // Create an advanced content step
  const advancedStep = {
    title: `Advanced: ${path.topic}`,
    description: `Advanced concepts and applications of ${path.topic}`,
    content: `## Advanced: ${path.topic}\n\nThis step covers advanced concepts and applications of ${path.topic} for learners who have demonstrated strong understanding of the core material.`,
    order: checkpoint.afterStep + 0.2, // Insert after the checkpoint
    estimatedTimeMinutes: 45,
    resources: [],
    quiz: [],
    completed: false
  };

  // Add the advanced step to the path
  path.steps.push(advancedStep);

  // Re-order steps
  path.steps.sort((a, b) => a.order - b.order);

  return path;
};

module.exports = {
  createLearningPath,
  getLearningPathById,
  updateLearningPath,
  completeStep,
  takeCheckpoint,
  getUserLearningPaths,
  parsePathContent,
  identifyPrerequisites,
  createBranch,
  adaptPathBasedOnPerformance
};
