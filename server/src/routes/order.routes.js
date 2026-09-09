import express from "express";

import {
  placeOrder,
  getMyOrders,
  getOrder,
} from "../controllers/order.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();


// Create market order
router.post("/", protect, placeOrder);


// Get all orders
router.get("/", protect, getMyOrders);


// Get single order
router.get("/:id", protect, getOrder);


export default router;