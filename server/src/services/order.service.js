import Account from "../models/Account.js";
import SymbolModel from "../models/Symbol.js";
import Order from "../models/Order.js";
import Position from "../models/Position.js";
import Trade from "../models/Trade.js";

export const createMarketOrder = async ({
  userId,
  side,
  symbol,
  volume,
  stopLoss = null,
  takeProfit = null,
}) => {
  // 1. Validate side
  if (!["buy", "sell"].includes(side)) {
    throw new Error("Side must be buy or sell");
  }

  // 2. Validate volume
  if (!volume || volume <= 0) {
    throw new Error("Volume must be greater than 0");
  }

  // 3. Find account
  const account = await Account.findOne({
    user: userId,
  });

  if (!account) {
    throw new Error("Trading account not found");
  }

  if (account.status && account.status !== "active") {
    throw new Error("Trading account is disabled");
  }

  // 4. Find symbol
  const marketSymbol = await SymbolModel.findOne({
    symbol: symbol.toUpperCase(),
    isActive: true,
  });

  if (!marketSymbol) {
    throw new Error("Symbol not found or inactive");
  }

  // 5. Validate lot size
  if (volume < marketSymbol.minLot) {
    throw new Error(`Minimum volume is ${marketSymbol.minLot}`);
  }

  if (volume > marketSymbol.maxLot) {
    throw new Error(`Maximum volume is ${marketSymbol.maxLot}`);
  }

  // Check lot step
  const stepCheck = Math.round((volume / marketSymbol.lotStep) * 100) / 100;

  if (!Number.isInteger(stepCheck)) {
    throw new Error(`Volume must be in steps of ${marketSymbol.lotStep}`);
  }

  // 6. Determine execution price
  const executionPrice = side === "buy" ? marketSymbol.ask : marketSymbol.bid;

  // 7. Calculate margin
  const margin =
    (volume * marketSymbol.contractSize * executionPrice) / account.leverage;

  // 8. Check free margin
  if (account.freeMargin < margin) {
    throw new Error("Insufficient free margin");
  }

  // 9. Create order
  const order = await Order.create({
    user: userId,
    account: account._id,
    symbol: marketSymbol.symbol,
    type: "market",
    side,
    volume,
    price: executionPrice,
    stopLoss,
    takeProfit,
    status: "filled",
    filledAt: new Date(),
  });

  // 10. Create position
  const position = await Position.create({
    user: userId,
    account: account._id,
    order: order._id,
    symbol: marketSymbol.symbol,
    side,
    volume,
    openPrice: executionPrice,
    currentPrice: executionPrice,
    stopLoss,
    takeProfit,
    margin,
    floatingPnl: 0,
    status: "open",
  });

  // 11. Create trade record
  const trade = await Trade.create({
    user: userId,
    account: account._id,
    order: order._id,
    position: position._id,
    symbol: marketSymbol.symbol,
    side,
    volume,
    openPrice: executionPrice,
    pnl: 0,
    commission: 0,
    swap: 0,
    status: "open",
  });

  // 12. Update account margin
  account.margin += margin;
  account.freeMargin = account.equity - account.margin;

  await account.save();

  return {
    order,
    position,
    trade,
    account,
  };
};
