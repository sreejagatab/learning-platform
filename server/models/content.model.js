const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['note', 'learning_path', 'article', 'summary', 'quiz', 'flashcards'],
    required: true,
    default: 'note'
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  metadata: {
    topic: String,
    subtopics: [String],
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced']
    },
    tags: [String],
    citations: [{
      id: String,
      title: String,
      url: String,
      snippet: String,
      published_date: String
    }],
    relatedQueries: [String]
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastAccessed: {
    type: Date
  }
});

// Text index for search
ContentSchema.index({ 
  title: 'text', 
  content: 'text', 
  'metadata.topic': 'text', 
  'metadata.tags': 'text' 
});

// Update the updatedAt timestamp before saving
ContentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Content', ContentSchema);
