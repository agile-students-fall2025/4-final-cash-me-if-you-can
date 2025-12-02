const mongoose = require('mongoose');

const recurringTransactionSchema = new mongoose.Schema(
  {
    recurring_id: {
      type: String,
      required: true,
      unique: true,
    },
    user_id: {
      type: String,
      required: true,
    },
    account_id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    merchant_name: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: [String],
      default: [],
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'],
      required: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
    },
    next_occurrence: {
      type: Date,
      required: true,
    },
    day_of_month: {
      type: Number,
      min: 1,
      max: 31,
    },
    day_of_week: {
      type: Number,
      min: 0,
      max: 6,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
    },
    payment_channel: {
      type: String,
      default: 'other',
    },
    currency_code: {
      type: String,
      default: 'USD',
    },
    last_executed: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
recurringTransactionSchema.index({ user_id: 1, is_active: 1 });
recurringTransactionSchema.index({ next_occurrence: 1, is_active: 1 });

const RecurringTransaction = mongoose.model('RecurringTransaction', recurringTransactionSchema);

module.exports = RecurringTransaction;
