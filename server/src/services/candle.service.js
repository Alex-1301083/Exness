import Candle from "../models/Candle.js";

const TIMEFRAMES = {
  "1m": 60,
  "5m": 300,
  "15m": 900,
  "1H": 3600,
  "4H": 14400,
  "1D": 86400,
};

export const updateCandle = async ({
  symbol,
  price,
  timeframe = "1m",
}) => {
  try {
    const normalizedSymbol = symbol.toUpperCase();
    const seconds = TIMEFRAMES[timeframe];

    if (!seconds) {
      throw new Error(`Unsupported timeframe: ${timeframe}`);
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice)) {
      throw new Error("Invalid price");
    }

    const now = Math.floor(Date.now() / 1000);

    const candleTime =
      Math.floor(now / seconds) * seconds;

    // First try to update an existing candle.
    const existingCandle = await Candle.findOneAndUpdate(
      {
        symbol: normalizedSymbol,
        timeframe,
        time: candleTime,
      },
      {
        $max: {
          high: numericPrice,
        },
        $min: {
          low: numericPrice,
        },
        $set: {
          close: numericPrice,
        },
        $inc: {
          volume: 1,
        },
      },
      {
        returnDocument: "after",
      }
    );

    if (existingCandle) {
      return existingCandle;
    }

    // Candle does not exist, so create it.
    try {
      const newCandle = await Candle.create({
        symbol: normalizedSymbol,
        timeframe,
        time: candleTime,
        open: numericPrice,
        high: numericPrice,
        low: numericPrice,
        close: numericPrice,
        volume: 1,
      });

      return newCandle;
    } catch (createError) {
      // Another price-feed call may have created the
      // same candle between findOneAndUpdate and create.
      if (createError.code === 11000) {
        const existingAfterRace =
          await Candle.findOneAndUpdate(
            {
              symbol: normalizedSymbol,
              timeframe,
              time: candleTime,
            },
            {
              $max: {
                high: numericPrice,
              },
              $min: {
                low: numericPrice,
              },
              $set: {
                close: numericPrice,
              },
              $inc: {
                volume: 1,
              },
            },
            {
              returnDocument: "after",
            }
          );

        return existingAfterRace;
      }

      throw createError;
    }
  } catch (error) {
    console.error(
      `Candle update error [${symbol} ${timeframe}]:`,
      error.message
    );

    return null;
  }
};

export const getHistoricalCandles = async ({
  symbol,
  timeframe = "1m",
  limit = 200,
}) => {
  try {
    const candles = await Candle.find({
      symbol: symbol.toUpperCase(),
      timeframe,
    })
      .sort({ time: -1 })
      .limit(Number(limit))
      .lean();

    return candles.reverse();
  } catch (error) {
    console.error(
      `Historical candle error [${symbol} ${timeframe}]:`,
      error.message
    );

    return [];
  }
};