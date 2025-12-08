const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  password_hash: {
    type: String,
    required: true,
  },
  plaid_user_id: {
    type: String,
    sparse: true,
  },
  preferences: {
    currency: {
      type: String,
      default: 'USD',
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto',
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: false },
    },
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  email_verified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});


module.exports = mongoose.model('User', userSchema);
