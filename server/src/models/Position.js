import mongoose from "mongoose";

const positionSchema = new mongoose.Schema(
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

    symbol: {
      type: String,
      required: true,
      uppercase: true,
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

    currentPrice: {
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

    margin: {
      type: Number,
      default: 0,
    },

    floatingPnl: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },

    closedPrice: {
      type: Number,
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

const Position = mongoose.model("Position", positionSchema);

export default Position;