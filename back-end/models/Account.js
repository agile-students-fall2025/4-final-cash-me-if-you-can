const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema(
  {
    // Plaid API fields
    account_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    item_id: {
      type: String,
      required: true,
      index: true,
    },
    // Account information
    name: {
      type: String,
      required: true,
    },
    official_name: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: ['depository', 'credit', 'loan', 'investment', 'other'],
      required: true,
    },
    subtype: {
      type: String,
      enum: [
        'checking',
        'savings',
        'money market',
        'prepaid',
        'cash management',
        'credit card',
        'paypal',
        'auto',
        'mortgage',
        'line of credit',
        'student',
        'investment',
        'other',
      ],
      required: true,
    },
    // Balance information
    balances: {
      available: {
        type: Number,
        default: null,
      },
      current: {
        type: Number,
        default: null,
      },
      iso_currency_code: {
        type: String,
        default: 'USD',
      },
      limit: {
        type: Number,
        default: null,
      },
      unofficial_currency_code: {
        type: String,
        default: null,
      },
    },
    // Account identification
    mask: {
      type: String,
      default: null,
    },
    verification_status: {
      type: String,
      enum: ['verified', 'unverified', 'pending_automatic_verification'],
      default: 'unverified',
    },
    // Access token reference
    access_token: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for common queries
AccountSchema.index({ user_id: 1, item_id: 1 });

module.exports = mongoose.model('Account', AccountSchema);
