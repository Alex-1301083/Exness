import Candle from "../models/Candle.js";
import SymbolModel from "../models/Symbol.js";

const TIMEFRAMES = {
  "1m": 60,
  "5m": 300,
  "15m": 900,
  "1H": 3600,
  "4H": 14400,
  "1D": 86400,
};

export const seedHistoricalCandles = async (req, res) => {
  try {
    const symbols = await SymbolModel.find({
      isActive: true,
    }).lean();

    if (!symbols.length) {
      return res.status(404).json({
        success: false,
        message: "No active symbols found",
      });
    }

    // Remove old generated candles
    await Candle.deleteMany({});

    const candles = [];
    const now = Math.floor(Date.now() / 1000);

    for (const symbol of symbols) {
      const basePrice = Number(symbol.bid);

      for (const [timeframe, seconds] of Object.entries(
        TIMEFRAMES
      )) {
        let previousClose = basePrice;

        for (let i = 200; i >= 1; i--) {
          const time =
            Math.floor(
              (now - i * seconds) / seconds
            ) * seconds;

          // Realistic movement
          const volatility =
            Math.max(
              basePrice * 0.0015,
              symbol.spread * 3
            );

          const open = previousClose;

          const change =
            (Math.random() - 0.5) * volatility;

          const close = open + change;

          const high =
            Math.max(open, close) +
            Math.random() * volatility * 0.5;

          const low =
            Math.min(open, close) -
            Math.random() * volatility * 0.5;

          candles.push({
            symbol: symbol.symbol,
            timeframe,
            time,

            open: Number(
              open.toFixed(symbol.digits)
            ),

            high: Number(
              high.toFixed(symbol.digits)
            ),

            low: Number(
              low.toFixed(symbol.digits)
            ),

            close: Number(
              close.toFixed(symbol.digits)
            ),

            volume:
              Math.floor(
                Math.random() * 900
              ) + 100,
          });

          previousClose = close;
        }
      }
    }

    await Candle.insertMany(candles);

    return res.status(201).json({
      success: true,
      message:
        "Historical candles generated successfully",
      count: candles.length,
    });
  } catch (error) {
    console.error(
      "Seed Historical Candles Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate historical candles",
      error: error.message,
    });
  }
};