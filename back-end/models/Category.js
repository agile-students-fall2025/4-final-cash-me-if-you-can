const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  system: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: String,
  },
  color: {
    type: String,
    match: /^#[0-9A-F]{6}$/i,
  },
  keywords: {
    type: [String],
    default: [],
  },
  description: {
    type: String,
  },
}, {
  timestamps: true,
});

categorySchema.index({ user_id: 1, system: 1 });
categorySchema.index({ name: 1 });

module.exports = mongoose.model('Category', categorySchema);
