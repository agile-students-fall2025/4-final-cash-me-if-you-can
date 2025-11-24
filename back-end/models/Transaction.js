const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    // Plaid API fields
    transaction_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    account_id: {
      type: String,
      required: true,
      ref: 'Account',
      index: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Transaction details
    date: {
      type: Date,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    merchant_name: {
      type: String,
      default: null,
    },
    amount: {
      type: Number,
      required: true,
    },
    // Category information
    category: {
      type: [String],
      default: ['Uncategorized'],
    },
    // Transaction status
    pending: {
      type: Boolean,
      default: false,
      index: true,
    },
    payment_channel: {
      type: String,
      enum: ['in store', 'online', 'other'],
      default: 'other',
    },
    // Additional Plaid fields
    authorized_date: {
      type: Date,
      default: null,
    },
    check_number: {
      type: String,
      default: null,
    },
    counterparty: {
      name: String,
      type: String,
      confidence_level: String,
    },
    currency_code: {
      type: String,
      default: 'USD',
    },
    location: {
      address: String,
      city: String,
      state: String,
      zip: String,
      lat: Number,
      lon: Number,
    },
    payment_method: {
      type: String,
      enum: ['card present', 'card not present', 'online transfer', 'check', 'transfer', null],
      default: null,
    },
    website: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for common queries
TransactionSchema.index({ user_id: 1, date: -1 });
TransactionSchema.index({ user_id: 1, account_id: 1, date: -1 });
TransactionSchema.index({ user_id: 1, pending: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
