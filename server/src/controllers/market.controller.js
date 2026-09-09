import SymbolModel from "../models/Symbol.js";

import {
  updateSymbolPrice,
  generateMockPrice,
} from "../services/price.service.js";

import { getHistoricalCandles } from "../services/candle.service.js";


// ======================================================
// GET ALL SYMBOLS
// ======================================================

export const getSymbols = async (req, res) => {
  try {
    const symbols = await SymbolModel.find({
      isActive: true,
    }).sort({ symbol: 1 });

    return res.status(200).json({
      success: true,
      count: symbols.length,
      symbols,
    });

  } catch (error) {
    console.error("Get Symbols Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// GET SINGLE SYMBOL
// ======================================================

export const getSymbol = async (req, res) => {
  try {
    const symbol = await SymbolModel.findOne({
      symbol: req.params.symbol.toUpperCase(),
      isActive: true,
    });

    if (!symbol) {
      return res.status(404).json({
        success: false,
        message: "Symbol not found",
      });
    }

    return res.status(200).json({
      success: true,
      symbol,
    });

  } catch (error) {
    console.error("Get Symbol Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// SEED SYMBOLS
// ======================================================

export const seedSymbols = async (req, res) => {
  try {

    const symbols = [
      {
        symbol: "XAUUSD",
        name: "Gold / U.S. Dollar",
        category: "metal",
        baseAsset: "XAU",
        quoteAsset: "USD",
        bid: 3400,
        ask: 3400.30,
        spread: 0.30,
        digits: 2,
        contractSize: 100,
        minLot: 0.01,
        maxLot: 100,
        lotStep: 0.01,
        isActive: true,
      },

      {
        symbol: "EURUSD",
        name: "Euro / U.S. Dollar",
        category: "forex",
        baseAsset: "EUR",
        quoteAsset: "USD",
        bid: 1.17,
        ask: 1.1702,
        spread: 0.0002,
        digits: 5,
        contractSize: 100000,
        minLot: 0.01,
        maxLot: 100,
        lotStep: 0.01,
        isActive: true,
      },

      {
        symbol: "GBPUSD",
        name: "British Pound / U.S. Dollar",
        category: "forex",
        baseAsset: "GBP",
        quoteAsset: "USD",
        bid: 1.35,
        ask: 1.3502,
        spread: 0.0002,
        digits: 5,
        contractSize: 100000,
        minLot: 0.01,
        maxLot: 100,
        lotStep: 0.01,
        isActive: true,
      },

      {
        symbol: "BTCUSD",
        name: "Bitcoin / U.S. Dollar",
        category: "crypto",
        baseAsset: "BTC",
        quoteAsset: "USD",
        bid: 110000,
        ask: 110050,
        spread: 50,
        digits: 2,
        contractSize: 1,
        minLot: 0.01,
        maxLot: 100,
        lotStep: 0.01,
        isActive: true,
      },
    ];

    const result = [];

    for (const data of symbols) {

      const symbol = await SymbolModel.findOneAndUpdate(
        { symbol: data.symbol },
        data,
        {
          new: true,
          upsert: true,
        }
      );

      result.push(symbol);
    }

    return res.status(200).json({
      success: true,
      message: "Symbols seeded successfully",
      count: result.length,
      symbols: result,
    });

  } catch (error) {
    console.error("Seed Symbols Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// MANUAL PRICE UPDATE
// ======================================================

export const updatePrice = async (req, res) => {
  try {

    const { symbol, bid, ask } = req.body || {};

    if (
      !symbol ||
      bid === undefined ||
      ask === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "symbol, bid and ask are required",
      });
    }

    const updatedSymbol = await updateSymbolPrice(
      symbol,
      Number(bid),
      Number(ask)
    );

    return res.status(200).json({
      success: true,
      message: "Price updated successfully",
      symbol: updatedSymbol,
    });

  } catch (error) {

    console.error("Update Price Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// GENERATE MOCK PRICE
// ======================================================

export const mockPrice = async (req, res) => {
  try {

    const { symbol } = req.body || {};

    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: "symbol is required",
      });
    }

    const updatedPrice = await generateMockPrice(
      symbol
    );

    return res.status(200).json({
      success: true,
      message: "Mock price generated",
      data: updatedPrice,
    });

  } catch (error) {

    console.error("Mock Price Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};



export const getCandles = async (req, res) => {
  try {
    const { symbol } = req.params;

    const timeframe = req.query.timeframe || "1m";
    const limit = Number(req.query.limit) || 200;

    const candles = await getHistoricalCandles({
      symbol,
      timeframe,
      limit,
    });

    return res.status(200).json({
      success: true,
      symbol: symbol.toUpperCase(),
      timeframe,
      count: candles.length,
      candles,
    });
  } catch (error) {
    console.error("Get Candles Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch candles",
    });
  }
};

export const seedHistoricalCandles = async (req, res) => {
  try {
    const Candle = (await import("../models/Candle.js")).default;

    const symbols = [
      {
        symbol: "BTCUSD",
        price: 78747.95,
        digits: 2,
        movement: 80,
      },
      {
        symbol: "XAUUSD",
        price: 4422.679,
        digits: 3,
        movement: 3,
      },
      {
        symbol: "XAGUSD",
        price: 66.560,
        digits: 3,
        movement: 0.08,
      },
      {
        symbol: "ETHUSD",
        price: 2479.57,
        digits: 2,
        movement: 10,
      },
      {
        symbol: "USOIL",
        price: 91.265,
        digits: 3,
        movement: 0.4,
      },
      {
        symbol: "USDJPY",
        price: 153.552,
        digits: 3,
        movement: 0.08,
      },
      {
        symbol: "EURUSD",
        price: 1.16235,
        digits: 5,
        movement: 0.001,
      },
      {
        symbol: "USTEC",
        price: 29710.45,
        digits: 2,
        movement: 80,
      },
    ];

    const timeframes = {
      "1m": 60,
      "5m": 300,
      "15m": 900,
      "1H": 3600,
      "4H": 14400,
      "1D": 86400,
    };

    const candles = [];

    const now = Math.floor(Date.now() / 1000);

    for (const item of symbols) {
      for (const [timeframe, seconds] of Object.entries(
        timeframes,
      )) {
        let price = item.price;

        for (let i = 200; i > 0; i--) {
          const time =
            Math.floor(
              (now - i * seconds) / seconds,
            ) * seconds;

          const open = price;

          const change =
            (Math.random() - 0.5) *
            item.movement;

          const close = open + change;

          const high =
            Math.max(open, close) +
            Math.random() *
              item.movement *
              0.5;

          const low =
            Math.min(open, close) -
            Math.random() *
              item.movement *
              0.5;

          candles.push({
            symbol: item.symbol,

            timeframe,

            time,

            open: Number(
              open.toFixed(item.digits),
            ),

            high: Number(
              high.toFixed(item.digits),
            ),

            low: Number(
              low.toFixed(item.digits),
            ),

            close: Number(
              close.toFixed(item.digits),
            ),

            volume: Math.floor(
              Math.random() * 1000,
            ),
          });

          price = close;
        }
      }
    }

    await Candle.deleteMany({});

    await Candle.insertMany(candles);

    return res.status(201).json({
      success: true,
      message: "Historical candles generated successfully",
      count: candles.length,
    });
  } catch (error) {
    console.error(
      "Seed Candles Error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to generate historical candles",
    });
  }
};