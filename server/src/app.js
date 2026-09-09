import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import accountRoutes from "./routes/account.routes.js";
import marketRoutes from "./routes/market.routes.js";
import orderRoutes from "./routes/order.routes.js";
import positionRoutes from "./routes/position.routes.js";
import tradeRoutes from "./routes/trade.routes.js";

import { setupPriceFeed } from "./sockets/priceFeed.socket.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/positions", positionRoutes);
app.use("/api/trades", tradeRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Tradex API is running",
  });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

// Start server only after MongoDB connection
const startServer = async () => {
  try {
    await connectDB();

    console.log("✅ Database connection successful");

    setupPriceFeed(io);

    server.listen(PORT, () => {
      console.log(`🚀 Tradex API running on http://localhost:${PORT}`);
      console.log("🔌 Socket.IO server is running");
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();