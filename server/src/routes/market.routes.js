import express from "express";

import {
  getSymbols,
  getSymbol,
  seedSymbols,
  updatePrice,
  mockPrice,
  getCandles,
} from "../controllers/market.controller.js";

import {
  seedHistoricalCandles,
} from "../controllers/candle.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/symbols", protect, getSymbols);

router.get("/symbols/:symbol", protect, getSymbol);

router.get("/candles/:symbol", getCandles);

router.post("/seed", protect, seedSymbols);

// TEMPORARY: historical candle seeding
router.post("/seed-candles", seedHistoricalCandles);

router.post("/price", protect, updatePrice);

router.post("/mock-price", protect, mockPrice);

export default router;