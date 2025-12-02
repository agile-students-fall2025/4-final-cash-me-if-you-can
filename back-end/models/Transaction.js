const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transaction_id: {
    type: String,
    required: true,
    unique: true,
  },
  account_id: {
    type: String,
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Manual vs Plaid flag
  is_manual: {
    type: Boolean,
    default: false,
  },
  source: {
    type: String,
    enum: ['plaid', 'manual', 'import'],
    default: 'manual',
  },
  date: {
    type: Date,
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
  // Manual entry fields
  notes: {
    type: String,
  },
  receipt_url: {
    type: String,
  },
  pending: {
    type: Boolean,
    default: false,
  },
  payment_channel: {
    type: String,
    enum: ['in store', 'online', 'other'],
    default: 'other',
  },
  authorized_date: {
    type: Date,
  },
  check_number: {
    type: String,
  },
  currency_code: {
    type: String,
    default: 'USD',
  },
  location: {
    address: String,
    city: String,
    region: String,
    postal_code: String,
    country: String,
    lat: Number,
    lon: Number,
    store_number: String,
  },
  payment_meta: {
    by_order_of: String,
    payee: String,
    payer: String,
    payment_method: String,
    payment_processor: String,
    ppd_id: String,
    reason: String,
    reference_number: String,
  },
  website: {
    type: String,
  },
  counterparty: {
    name: String,
    type: String,
    logo_url: String,
    website: String,
    entity_id: String,
    confidence_level: String,
  },
}, {
  timestamps: true,
});

transactionSchema.index({ user_id: 1, date: -1 });
transactionSchema.index({ user_id: 1, account_id: 1, date: -1 });
transactionSchema.index({ user_id: 1, pending: 1 });
transactionSchema.index({ transaction_id: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
