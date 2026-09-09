import SymbolModel from "../models/Symbol.js";
import Position from "../models/Position.js";

import {
  updatePositionPrices,
  checkAndExecuteStops,
} from "../services/position.service.js";

import { updateCandle } from "../services/candle.service.js";

export const setupPriceFeed = (io) => {
  console.log("Price feed initialized");

  // Client connected
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("subscribeSymbol", async (symbol) => {
      try {
        const marketSymbol = await SymbolModel.findOne({
          symbol: symbol.toUpperCase(),
          isActive: true,
        });

        if (!marketSymbol) {
          socket.emit("priceError", {
            message: "Symbol not found",
          });
          return;
        }

        socket.join(marketSymbol.symbol);

        socket.emit("priceUpdate", {
          symbol: marketSymbol.symbol,
          bid: marketSymbol.bid,
          ask: marketSymbol.ask,
          spread: marketSymbol.spread,
        });

        console.log(`Client ${socket.id} subscribed to ${marketSymbol.symbol}`);
      } catch (error) {
        console.error("Subscribe Error:", error);
      }
    });

    socket.on("unsubscribeSymbol", (symbol) => {
      socket.leave(symbol.toUpperCase());

      console.log(
        `Client ${socket.id} unsubscribed from ${symbol.toUpperCase()}`,
      );
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  // Automatic price updates
  setInterval(async () => {
    try {
      const symbols = await SymbolModel.find({
        isActive: true,
      });

      for (const marketSymbol of symbols) {
        let movement;

        switch (marketSymbol.symbol) {
          case "BTCUSD":
            movement = (Math.random() - 0.5) * 20;
            break;

          case "ETHUSD":
            movement = (Math.random() - 0.5) * 5;
            break;

          case "XAUUSD":
            movement = (Math.random() - 0.5) * 1;
            break;

          case "XAGUSD":
            movement = (Math.random() - 0.5) * 0.05;
            break;

          case "USOIL":
            movement = (Math.random() - 0.5) * 0.2;
            break;

          case "USDJPY":
            movement = (Math.random() - 0.5) * 0.05;
            break;

          case "EURUSD":
            movement = (Math.random() - 0.5) * 0.0005;
            break;

          case "USTEC":
            movement = (Math.random() - 0.5) * 20;
            break;

          default:
            movement = 0;
        }

        const newBid = Number(
          (marketSymbol.bid + movement).toFixed(marketSymbol.digits),
        );

        const newAsk = Number(
          (newBid + marketSymbol.spread).toFixed(marketSymbol.digits),
        );

        marketSymbol.bid = newBid;
        marketSymbol.ask = newAsk;

        await marketSymbol.save();

        // Send live price to subscribed clients
        io.to(marketSymbol.symbol).emit("priceUpdate", {
          symbol: marketSymbol.symbol,
          bid: newBid,
          ask: newAsk,
          spread: marketSymbol.spread,
        });

        await updateCandle({
          symbol: marketSymbol.symbol,
          price: newBid,
          timeframe: "1m",
        });

        // Update open positions P/L
        const userIds = await Position.distinct("user", {
          symbol: marketSymbol.symbol,
          status: "open",
        });

        for (const userId of userIds) {
          try {
            await updatePositionPrices(userId.toString());
            await checkAndExecuteStops(userId.toString());
          } catch (error) {
            console.error(
              `Position P/L update failed for user ${userId}:`,
              error.message,
            );
          }
        }
      }
    } catch (error) {
      console.error("Price Feed Error:", error);
    }
  }, 1000);
};
