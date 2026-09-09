import SymbolModel from "../models/Symbol.js";


// ======================================================
// UPDATE SYMBOL PRICE
// ======================================================

export const updateSymbolPrice = async (
  symbol,
  bid,
  ask
) => {

  const marketSymbol = await SymbolModel.findOne({
    symbol: symbol.toUpperCase(),
    isActive: true,
  });

  if (!marketSymbol) {
    throw new Error("Symbol not found or inactive");
  }


  marketSymbol.bid = Number(bid);
  marketSymbol.ask = Number(ask);

  marketSymbol.spread = Number(
    (marketSymbol.ask - marketSymbol.bid).toFixed(
      marketSymbol.digits
    )
  );


  await marketSymbol.save();


  return marketSymbol;
};


// ======================================================
// GET CURRENT PRICE
// ======================================================

export const getCurrentPrice = async (symbol) => {

  const marketSymbol = await SymbolModel.findOne({
    symbol: symbol.toUpperCase(),
    isActive: true,
  });

  if (!marketSymbol) {
    throw new Error("Symbol not found or inactive");
  }


  return {
    symbol: marketSymbol.symbol,
    bid: marketSymbol.bid,
    ask: marketSymbol.ask,
    spread: marketSymbol.spread,
  };
};


// ======================================================
// MOCK PRICE GENERATOR
// ======================================================

export const generateMockPrice = async (symbol) => {

  const marketSymbol = await SymbolModel.findOne({
    symbol: symbol.toUpperCase(),
    isActive: true,
  });

  if (!marketSymbol) {
    throw new Error("Symbol not found or inactive");
  }


  const currentBid = marketSymbol.bid;

  // Small random movement
  const movement =
    (Math.random() - 0.5) * 2;


  const newBid = Number(
    (currentBid + movement).toFixed(
      marketSymbol.digits
    )
  );


  const newAsk = Number(
    (
      newBid + marketSymbol.spread
    ).toFixed(
      marketSymbol.digits
    )
  );


  marketSymbol.bid = newBid;
  marketSymbol.ask = newAsk;


  await marketSymbol.save();


  return {
    symbol: marketSymbol.symbol,
    bid: newBid,
    ask: newAsk,
    spread: marketSymbol.spread,
  };
};