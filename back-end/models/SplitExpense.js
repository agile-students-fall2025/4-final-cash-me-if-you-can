const mongoose = require('mongoose');

const splitExpenseSchema = new mongoose.Schema({
  split_id: {
    type: String,
    unique: true,
    default: () => 'split_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  },
  user_id: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  total_amount: {
    type: Number,
    required: true
  },
  split_with: {
    type: Number,
    required: true,
    min: 2
  },
  per_person_amount: {
    type: Number
  },
  category: {
    type: String,
    default: 'Other'
  },
  participants: [{
    type: String
  }],
  is_settled: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate per_person_amount before saving
splitExpenseSchema.pre('save', function(next) {
  if (this.total_amount && this.split_with) {
    this.per_person_amount = Math.round((this.total_amount / this.split_with) * 100) / 100;
  }
  next();
});

module.exports = mongoose.model('SplitExpense', splitExpenseSchema);
