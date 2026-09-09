import mongoose from "mongoose";

const symbolSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: ["forex", "metal", "crypto", "stock", "index"],
      required: true,
    },

    baseAsset: {
      type: String,
      required: true,
    },

    quoteAsset: {
      type: String,
      required: true,
    },

    bid: {
      type: Number,
      default: 0,
    },

    ask: {
      type: Number,
      default: 0,
    },

    spread: {
      type: Number,
      default: 0,
    },

    digits: {
      type: Number,
      default: 5,
    },

    contractSize: {
      type: Number,
      default: 100000,
    },

    minLot: {
      type: Number,
      default: 0.01,
    },

    maxLot: {
      type: Number,
      default: 100,
    },

    lotStep: {
      type: Number,
      default: 0.01,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const SymbolModel = mongoose.model("Symbol", symbolSchema);

export default SymbolModel;