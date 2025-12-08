const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  account_id: {
    type: String,
    required: true,
    unique: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // For Plaid accounts
  item_id: {
    type: String,
    required: false,
  },
  access_token: {
    type: String,
  },
  // Manual vs Plaid flag
  is_manual: {
    type: Boolean,
    default: false,
  },
  // Bank information
  bank_name: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  official_name: {
    type: String,
  },
  type: {
    type: String,
    required: true,
    enum: ['depository', 'credit', 'loan', 'investment', 'other'],
  },
  subtype: {
    type: String,
    required: true,
    enum: [
      'checking', 'savings', 'money market', 'cd', 'paypal',
      'prepaid', 'cash management', 'ebt', 'hsa',
      'credit card', 'auto', 'business', 'commercial',
      'construction', 'consumer', 'home equity', 'loan',
      'mortgage', 'overdraft', 'line of credit', 'student',
      '401k', '401a', '403b', '457b', '529', 'brokerage',
      'cash isa', 'education savings account', 'fixed annuity',
      'gic', 'health reimbursement arrangement', 'ira', 'isa',
      'keogh', 'lif', 'lira', 'lrif', 'lrsp', 'mutual fund',
      'non-taxable brokerage account', 'pension', 'plan',
      'prif', 'profit sharing plan', 'rdsp', 'resp', 'retirement',
      'rlif', 'roth', 'roth 401k', 'rrif', 'rrsp', 'sarsep',
      'sep ira', 'simple ira', 'sipp', 'stock plan', 'tfsa',
      'trust', 'ugma', 'utma', 'variable annuity', 'other',
    ],
  },
  balances: {
    current: {
      type: Number,
      required: true,
    },
    available: {
      type: Number,
    },
    limit: {
      type: Number,
    },
    currency: {
      type: String,
      default: 'USD',
    },
  },
  mask: {
    type: String,
  },
  verification_status: {
    type: String,
    enum: ['pending', 'verified', 'failed'],
    default: 'verified',
  },
  last_sync: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

accountSchema.index({ user_id: 1, item_id: 1 });

module.exports = mongoose.model('Account', accountSchema);
