import Position from "../models/Position.js";
import { updatePositionPrices , closePosition  } from "../services/position.service.js";

export const getMyPositions = async (req, res) => {
  try {
    const positions = await Position.find({
      user: req.user.userId,
      status: "open",
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: positions.length,
      positions,
    });
  } catch (error) {
    console.error("Get Positions Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getPosition = async (req, res) => {
  try {
    const position = await Position.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!position) {
      return res.status(404).json({
        success: false,
        message: "Position not found",
      });
    }

    return res.status(200).json({
      success: true,
      position,
    });
  } catch (error) {
    console.error("Get Position Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const updatePrices = async (req, res) => {
  try {
    const result = await updatePositionPrices(
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: "Position prices updated",
      data: result,
    });
  } catch (error) {
    console.error("Update Position Prices Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const closeMyPosition = async (req, res) => {
  try {
    const result = await closePosition(
      req.user.userId,
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Position closed successfully",
      data: result,
    });
  } catch (error) {
    console.error("Close Position Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};