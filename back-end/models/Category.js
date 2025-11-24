const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: true,
      index: true,
    },
    // System category or custom category
    system: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Optional icon or color for UI
    icon: {
      type: String,
      default: null,
    },
    color: {
      type: String,
      default: '#808080',
    },
    // Keywords for auto-categorization
    keywords: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding categories by user
CategorySchema.index({ user_id: 1, system: 1 });

module.exports = mongoose.model('Category', CategorySchema);
