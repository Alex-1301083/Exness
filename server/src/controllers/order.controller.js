import { createMarketOrder } from "../services/order.service.js";
import Order from "../models/Order.js";

export const placeOrder = async (req, res) => {
  try {
    const {
      symbol,
      side,
      volume,
      stopLoss,
      takeProfit,
    } = req.body;

    if (!symbol || !side || !volume) {
      return res.status(400).json({
        success: false,
        message: "symbol, side and volume are required",
      });
    }

    const result = await createMarketOrder({
      userId: req.user.userId,
      symbol,
      side,
      volume: Number(volume),
      stopLoss: stopLoss
        ? Number(stopLoss)
        : null,
      takeProfit: takeProfit
        ? Number(takeProfit)
        : null,
    });

    return res.status(201).json({
      success: true,
      message: "Market order executed successfully",
      data: result,
    });
  } catch (error) {
    console.error("Place Order Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET MY ORDER HISTORY
// ======================================================

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get Order History Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// GET SINGLE ORDER
// ======================================================

export const getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};