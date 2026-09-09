import Trade from "../models/Trade.js";


// ======================================================
// GET MY TRADE HISTORY
// ======================================================

export const getMyTrades = async (req, res) => {
  try {
    const trades = await Trade.find({
      user: req.user.userId,
    })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: trades.length,
      trades,
    });

  } catch (error) {
    console.error("Get Trade History Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// GET SINGLE TRADE
// ======================================================

export const getTrade = async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: "Trade not found",
      });
    }

    return res.status(200).json({
      success: true,
      trade,
    });

  } catch (error) {
    console.error("Get Trade Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};