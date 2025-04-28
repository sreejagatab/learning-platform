const mongoose = require('mongoose');

// Citation Schema
const CitationSchema = new mongoose.Schema({
  id: {
    type: String
  },
  title: {
    type: String
  },
  url: {
    type: String
  },
  snippet: {
    type: String
  },
  published_date: {
    type: String
  }
});

// Follow-up Schema
const FollowUpSchema = new mongoose.Schema({
  query: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  citations: [CitationSchema],
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// History Schema
const HistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    default: function() {
      return new mongoose.Types.ObjectId().toString();
    }
  },
  query: {
    type: String,
    required: [true, 'Query is required']
  },
  response: {
    type: String,
    required: [true, 'Response is required']
  },
  citations: [CitationSchema],
  followUps: [FollowUpSchema],
  queryTimestamp: {
    type: Date,
    default: Date.now
  },
  tags: [String],
  liked: {
    type: Boolean,
    default: false
  },
  userNotes: {
    type: String
  },
  learningContext: {
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate'
    },
    topic: {
      type: String
    },
    subtopic: {
      type: String
    }
  }
});

// Add text indexes for search
HistorySchema.index({ query: 'text', response: 'text', userNotes: 'text' });

// Add method to add a follow-up to history
HistorySchema.methods.addFollowUp = async function(followUpData) {
  this.followUps.push(followUpData);
  return this.save();
};

module.exports = mongoose.model('History', HistorySchema);
