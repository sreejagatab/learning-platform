const mongoose = require('mongoose');

/**
 * Learning Path Step Schema - Represents a single step in a learning path
 */
const LearningPathStepSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  estimatedTimeMinutes: {
    type: Number,
    default: 30
  },
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['article', 'video', 'book', 'course', 'tool', 'other'],
      default: 'article'
    },
    description: String
  }],
  quiz: [{
    question: String,
    options: [String],
    correctAnswer: Number,
    explanation: String
  }],
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningPathStep'
  }]
});

/**
 * Learning Path Schema - Represents a complete learning path with adaptive features
 */
const LearningPathSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  steps: [LearningPathStepSchema],
  branches: [{
    name: String,
    description: String,
    condition: {
      type: String,
      enum: ['interest', 'performance', 'time', 'manual'],
      default: 'manual'
    },
    steps: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningPathStep'
    }]
  }],
  prerequisites: [{
    topic: String,
    description: String,
    importance: {
      type: String,
      enum: ['required', 'recommended', 'optional'],
      default: 'recommended'
    },
    resourceUrl: String
  }],
  checkpoints: [{
    afterStep: {
      type: Number,
      required: true
    },
    questions: [{
      question: String,
      options: [String],
      correctAnswer: Number,
      explanation: String
    }],
    passingScore: {
      type: Number,
      default: 70
    },
    completed: {
      type: Boolean,
      default: false
    },
    score: {
      type: Number
    },
    completedAt: {
      type: Date
    },
    performanceData: {
      score: Number,
      incorrectAreas: [String],
      needsRemediation: Boolean,
      excellentPerformance: Boolean
    }
  }],
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  isAdaptive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
});

// Pre-save hook to update the updatedAt field
LearningPathSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to calculate progress based on completed steps
LearningPathSchema.methods.calculateProgress = function() {
  if (!this.steps || this.steps.length === 0) {
    return 0;
  }

  const completedSteps = this.steps.filter(step => step.completed).length;
  const totalSteps = this.steps.length;

  this.progress = Math.round((completedSteps / totalSteps) * 100);
  return this.progress;
};

// Method to mark a step as completed
LearningPathSchema.methods.completeStep = function(stepId) {
  const step = this.steps.id(stepId);
  if (!step) {
    throw new Error('Step not found');
  }

  step.completed = true;
  step.completedAt = new Date();

  // Recalculate progress
  this.calculateProgress();

  return this.save();
};

// Method to check if a checkpoint should be taken
LearningPathSchema.methods.shouldTakeCheckpoint = function() {
  if (!this.checkpoints || this.checkpoints.length === 0) {
    return false;
  }

  // Find the next uncompleted checkpoint
  const nextCheckpoint = this.checkpoints.find(cp => !cp.completed);
  if (!nextCheckpoint) {
    return false;
  }

  // Check if we've completed the step before this checkpoint
  const completedSteps = this.steps.filter(step => step.completed).length;
  return completedSteps >= nextCheckpoint.afterStep;
};

// Method to take a checkpoint and adjust the path based on performance
LearningPathSchema.methods.takeCheckpoint = async function(checkpointId, answers) {
  const checkpoint = this.checkpoints.id(checkpointId);
  if (!checkpoint) {
    throw new Error('Checkpoint not found');
  }

  // Calculate score
  let correctAnswers = 0;
  const incorrectAreas = [];

  answers.forEach((answer, index) => {
    if (answer === checkpoint.questions[index].correctAnswer) {
      correctAnswers++;
    } else {
      // Track areas where the user struggled
      const question = checkpoint.questions[index];
      const topic = question.question.replace('What is the main concept covered in "', '')
                                     .replace('"?', '')
                                     .trim();
      incorrectAreas.push(topic);
    }
  });

  const score = Math.round((correctAnswers / checkpoint.questions.length) * 100);
  checkpoint.score = score;
  checkpoint.completed = true;
  checkpoint.completedAt = new Date();

  // Store performance data for adaptive path adjustments
  checkpoint.performanceData = {
    score,
    incorrectAreas,
    needsRemediation: score < checkpoint.passingScore,
    excellentPerformance: score > 90
  };

  // Mark path as completed if all checkpoints are completed and score is passing
  const allCheckpointsCompleted = this.checkpoints.every(cp => cp.completed);
  const allCheckpointsPassed = this.checkpoints.every(cp => !cp.score || cp.score >= cp.passingScore);

  if (allCheckpointsCompleted && allCheckpointsPassed) {
    const allStepsCompleted = this.steps.every(step => step.completed);

    if (allStepsCompleted) {
      this.completedAt = new Date();
    }
  }

  return this.save();
};

const LearningPath = mongoose.model('LearningPath', LearningPathSchema);

module.exports = LearningPath;
