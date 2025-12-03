const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    budget_id: {
      type: String,
      required: true,
      unique: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    period: {
      type: String,
      enum: ["weekly", "monthly", "yearly"],
      default: "monthly",
    },
    start_date: {
      type: Date,
      default: Date.now,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

budgetSchema.index({ user_id: 1, category: 1 });
budgetSchema.index({ user_id: 1, is_active: 1 });

module.exports = mongoose.model("Budget", budgetSchema);
