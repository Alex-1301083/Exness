import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    accountNumber: {
      type: String,
      required: true,
      unique: true,
    },

    balance: {
      type: Number,
      default: 10000,
      min: 0,
    },

    equity: {
      type: Number,
      default: 10000,
    },

    margin: {
      type: Number,
      default: 0,
    },

    freeMargin: {
      type: Number,
      default: 10000,
    },

    leverage: {
      type: Number,
      default: 100,
    },

    currency: {
      type: String,
      default: "USD",
    },

    status: {
      type: String,
      enum: ["active", "disabled"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Account = mongoose.model("Account", accountSchema);

export default Account;