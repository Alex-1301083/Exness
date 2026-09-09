import express from "express";

import {
  createAccount,
  getMyAccount,
} from "../controllers/account.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createAccount);
router.get("/me", protect, getMyAccount);

export default router;