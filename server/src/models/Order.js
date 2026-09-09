import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },

    symbol: {
      type: String,
      required: true,
      uppercase: true,
    },

    type: {
      type: String,
      enum: ["market", "limit", "stop"],
      default: "market",
    },

    side: {
      type: String,
      enum: ["buy", "sell"],
      required: true,
    },

    volume: {
      type: Number,
      required: true,
      min: 0.01,
    },

    price: {
      type: Number,
      required: true,
    },

    stopLoss: {
      type: Number,
      default: null,
    },

    takeProfit: {
      type: Number,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "filled",
        "cancelled",
        "rejected",
        "closed",
      ],
      default: "pending",
    },

    filledAt: {
      type: Date,
      default: null,
    },

    closedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;