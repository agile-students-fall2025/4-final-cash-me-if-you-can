const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system', 'tool'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  tool_call_id: {
    type: String,
  },
  tool_calls: {
    type: mongoose.Schema.Types.Mixed,
  },
});

const chatConversationSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    default: 'New Conversation',
  },
  messages: [messageSchema],
  is_active: {
    type: Boolean,
    default: true,
  },
  last_message_at: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
chatConversationSchema.index({ user_id: 1, last_message_at: -1 });

// Generate a meaningful title from the first user message
chatConversationSchema.methods.generateTitle = function() {
  const firstUserMessage = this.messages.find(m => m.role === 'user');
  if (firstUserMessage) {
    let content = firstUserMessage.content.trim();
    
    // Remove common greeting prefixes
    const greetingPatterns = /^(hi|hello|hey|greetings|good morning|good afternoon|good evening)[,!.\s]*/i;
    content = content.replace(greetingPatterns, '').trim();
    
    // If content is now empty or too short, use original
    if (content.length < 3) {
      content = firstUserMessage.content.trim();
    }
    
    // Capitalize first letter
    content = content.charAt(0).toUpperCase() + content.slice(1);
    
    // Remove trailing punctuation for cleaner titles
    content = content.replace(/[?.!,]+$/, '');
    
    // Truncate intelligently - try to break at word boundary
    if (content.length > 40) {
      const truncated = content.substring(0, 40);
      const lastSpace = truncated.lastIndexOf(' ');
      if (lastSpace > 20) {
        content = truncated.substring(0, lastSpace) + '...';
      } else {
        content = truncated + '...';
      }
    }
    
    this.title = content || 'New Conversation';
  }
  return this.title;
};

module.exports = mongoose.model('ChatConversation', chatConversationSchema);
