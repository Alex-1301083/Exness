import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema(
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

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    position: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Position",
      default: null,
    },

    symbol: {
      type: String,
      required: true,
    },

    side: {
      type: String,
      enum: ["buy", "sell"],
      required: true,
    },

    volume: {
      type: Number,
      required: true,
    },

    openPrice: {
      type: Number,
      required: true,
    },

    closePrice: {
      type: Number,
      default: null,
    },

    pnl: {
      type: Number,
      default: 0,
    },

    commission: {
      type: Number,
      default: 0,
    },

    swap: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },

    openedAt: {
      type: Date,
      default: Date.now,
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

const Trade = mongoose.model("Trade", tradeSchema);

export default Trade;