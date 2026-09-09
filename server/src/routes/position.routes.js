import express from "express";

import {
  getMyPositions,
  getPosition,
  updatePrices,
  closeMyPosition,
} from "../controllers/position.controller.js";


import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getMyPositions);

router.post("/update-prices", protect, updatePrices);

router.post("/:id/close", protect, closeMyPosition);

router.get("/:id", protect, getPosition);


export default router;