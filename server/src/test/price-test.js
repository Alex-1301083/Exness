import { io } from "socket.io-client";

console.log("Starting Tradex Socket Test...");

const socket = io("http://localhost:5000", {
  transports: ["polling"],
  reconnection: false,
});

socket.on("connect", () => {
  console.log("✅ Connected to Tradex Socket");
  console.log("Socket ID:", socket.id);

  console.log("📡 Subscribing to XAUUSD...");

  socket.emit("subscribeSymbol", "XAUUSD");
});

socket.on("priceUpdate", (data) => {
  console.log(
    `📈 ${data.symbol} | Bid: ${data.bid} | Ask: ${data.ask} | Spread: ${data.spread}`
  );
});

socket.on("priceError", (error) => {
  console.error("❌ Price Error:", error);
});

socket.on("connect_error", (error) => {
  console.error("❌ Connection Error:", error.message);
});

socket.on("disconnect", (reason) => {
  console.log("🔴 Disconnected:", reason);
});