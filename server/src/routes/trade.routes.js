import express from "express";

import {
  getMyTrades,
  getTrade,
} from "../controllers/trade.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();


// Get all trades
router.get("/", protect, getMyTrades);


// Get single trade
router.get("/:id", protect, getTrade);


export default router;