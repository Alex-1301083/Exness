import mongoose from "mongoose";

const candleSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },

    timeframe: {
      type: String,
      enum: ["1m", "5m", "15m", "1H", "4H", "1D"],
      required: true,
      index: true,
    },

    time: {
      type: Number,
      required: true,
      index: true,
    },

    open: {
      type: Number,
      required: true,
    },

    high: {
      type: Number,
      required: true,
    },

    low: {
      type: Number,
      required: true,
    },

    close: {
      type: Number,
      required: true,
    },

    volume: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

candleSchema.index(
  {
    symbol: 1,
    timeframe: 1,
    time: 1,
  },
  {
    unique: true,
  }
);

const Candle = mongoose.model("Candle", candleSchema);

export default Candle;