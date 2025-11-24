const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    first_name: {
      type: String,
      default: null,
    },
    last_name: {
      type: String,
      default: null,
    },
    // Password will be handled by Sanay's auth implementation
    password_hash: {
      type: String,
      required: true,
    },
    // Plaid integration
    plaid_user_id: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
      index: true,
    },
    // User preferences
    preferences: {
      currency: {
        type: String,
        default: 'USD',
      },
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light',
      },
      notifications_enabled: {
        type: Boolean,
        default: true,
      },
    },
    // Account status
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
    email_verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', UserSchema);
