import Position from "../models/Position.js";
import SymbolModel from "../models/Symbol.js";
import Account from "../models/Account.js";
import Trade from "../models/Trade.js";
import Order from "../models/Order.js";


// ======================================================
// UPDATE OPEN POSITION PRICES + FLOATING P/L
// ======================================================

export const updatePositionPrices = async (userId) => {
  const positions = await Position.find({
    user: userId,
    status: "open",
  });

  let totalFloatingPnl = 0;
  let totalMargin = 0;

  for (const position of positions) {
    const marketSymbol = await SymbolModel.findOne({
      symbol: position.symbol,
      isActive: true,
    });

    if (!marketSymbol) {
      continue;
    }

    // BUY positions close at BID
    // SELL positions close at ASK
    const currentPrice =
      position.side === "buy"
        ? marketSymbol.bid
        : marketSymbol.ask;

    let floatingPnl;

    if (position.side === "buy") {
      floatingPnl =
        (currentPrice - position.openPrice) *
        position.volume *
        marketSymbol.contractSize;
    } else {
      floatingPnl =
        (position.openPrice - currentPrice) *
        position.volume *
        marketSymbol.contractSize;
    }

    position.currentPrice = currentPrice;

    position.floatingPnl = Number(
      floatingPnl.toFixed(2)
    );

    await position.save();

    totalFloatingPnl += position.floatingPnl;
    totalMargin += position.margin;
  }

  const account = await Account.findOne({
    user: userId,
    status: "active",
  });

  if (!account) {
    throw new Error("Trading account not found");
  }

  // Equity = Balance + Floating P/L
  account.equity = Number(
    (account.balance + totalFloatingPnl).toFixed(2)
  );

  // Total margin used by open positions
  account.margin = Number(
    totalMargin.toFixed(2)
  );

  // Free Margin = Equity - Margin
  account.freeMargin = Number(
    (account.equity - account.margin).toFixed(2)
  );

  await account.save();

  return {
    positions,
    account,
    totalFloatingPnl,
  };
};


// ======================================================
// CLOSE POSITION
// ======================================================

export const closePosition = async (userId, positionId) => {

  // 1. Find open position
  const position = await Position.findOne({
    _id: positionId,
    user: userId,
    status: "open",
  });

  if (!position) {
    throw new Error("Open position not found");
  }


  // 2. Find market symbol
  const marketSymbol = await SymbolModel.findOne({
    symbol: position.symbol,
    isActive: true,
  });

  if (!marketSymbol) {
    throw new Error("Symbol not found or inactive");
  }


  // 3. Get closing price
  // BUY closes at BID
  // SELL closes at ASK
  const closePrice =
    position.side === "buy"
      ? marketSymbol.bid
      : marketSymbol.ask;


  // 4. Calculate final P/L
  let finalPnl;

  if (position.side === "buy") {

    finalPnl =
      (closePrice - position.openPrice) *
      position.volume *
      marketSymbol.contractSize;

  } else {

    finalPnl =
      (position.openPrice - closePrice) *
      position.volume *
      marketSymbol.contractSize;
  }


  finalPnl = Number(
    finalPnl.toFixed(2)
  );


  // ====================================================
  // 5. CLOSE POSITION
  // ====================================================

  position.currentPrice = closePrice;

  position.floatingPnl = finalPnl;

  position.closedPrice = closePrice;

  position.closedAt = new Date();

  position.status = "closed";

  await position.save();


  // ====================================================
  // 6. CLOSE RELATED TRADE
  // ====================================================

  const trade = await Trade.findOne({
    position: position._id,
    user: userId,
    status: "open",
  });

  if (trade) {

    trade.closePrice = closePrice;

    trade.pnl = finalPnl;

    trade.closedAt = new Date();

    trade.status = "closed";

    await trade.save();
  }


  // ====================================================
  // 7. CLOSE RELATED ORDER
  // ====================================================

  const order = await Order.findOne({
    _id: position.order,
    user: userId,
  });

  if (order) {

    order.status = "closed";

    order.closedAt = new Date();

    await order.save();
  }


  // ====================================================
  // 8. UPDATE ACCOUNT
  // ====================================================

  const account = await Account.findOne({
    user: userId,
    status: "active",
  });

  if (!account) {
    throw new Error("Trading account not found");
  }


  // Add final P/L to balance
  account.balance = Number(
    (account.balance + finalPnl).toFixed(2)
  );


  // Release position margin
  account.margin = Number(
    (account.margin - position.margin).toFixed(2)
  );


  // Prevent negative margin
  if (account.margin < 0) {
    account.margin = 0;
  }


  // After position is closed,
  // Equity = Balance
  account.equity = account.balance;


  // Free Margin = Equity - Margin
  account.freeMargin = Number(
    (account.equity - account.margin).toFixed(2)
  );


  await account.save();


  // ====================================================
  // 9. RETURN RESULT
  // ====================================================

  return {
    position,
    trade,
    order,
    account,
    finalPnl,
    closePrice,
  };
};

export const checkAndExecuteStops = async (userId) => {
  try {
    const positions = await Position.find({
      user: userId,
      status: "open",
    });

    for (const position of positions) {
      const marketSymbol = await SymbolModel.findOne({
        symbol: position.symbol,
        isActive: true,
      });

      if (!marketSymbol) {
        continue;
      }

      // BUY position closes using BID price
      // SELL position closes using ASK price
      const currentPrice =
        position.side === "buy"
          ? marketSymbol.bid
          : marketSymbol.ask;

      let stopTriggered = false;
      let triggerType = null;

      // BUY
      if (position.side === "buy") {
        // Stop Loss
        if (
          position.stopLoss !== null &&
          currentPrice <= position.stopLoss
        ) {
          stopTriggered = true;
          triggerType = "Stop Loss";
        }

        // Take Profit
        if (
          position.takeProfit !== null &&
          currentPrice >= position.takeProfit
        ) {
          stopTriggered = true;
          triggerType = "Take Profit";
        }
      }

      // SELL
      if (position.side === "sell") {
        // Stop Loss
        if (
          position.stopLoss !== null &&
          currentPrice >= position.stopLoss
        ) {
          stopTriggered = true;
          triggerType = "Stop Loss";
        }

        // Take Profit
        if (
          position.takeProfit !== null &&
          currentPrice <= position.takeProfit
        ) {
          stopTriggered = true;
          triggerType = "Take Profit";
        }
      }

      if (stopTriggered) {
        console.log(
          `⚡ ${triggerType} triggered for ${position.symbol} ${position._id}`
        );

        try {
          const result = await closePosition(
            userId,
            position._id.toString()
          );

          console.log(
            `✅ Position automatically closed | ${triggerType} | P/L: ${result.finalPnl}`
          );
        } catch (error) {
          console.error(
            `❌ Automatic position close failed:`,
            error.message
          );
        }
      }
    }
  } catch (error) {
    console.error("SL/TP Check Error:", error);
  }
};