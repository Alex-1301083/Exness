import Account from "../models/Account.js";

export const createAccount = async (req, res) => {
  try {
    const existingAccount = await Account.findOne({
      user: req.user.userId,
    });

    if (existingAccount) {
      return res.status(409).json({
        success: false,
        message: "Trading account already exists",
      });
    }

    const accountNumber =
      "TX" + Math.floor(10000000 + Math.random() * 90000000);

    const account = await Account.create({
      user: req.user.userId,
      accountNumber,
      balance: 10000,
      equity: 10000,
      margin: 0,
      freeMargin: 10000,
      leverage: 100,
    });

    return res.status(201).json({
      success: true,
      message: "Trading account created successfully",
      account,
    });
  } catch (error) {
    console.error("Create Account Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getMyAccount = async (req, res) => {
  try {
    const account = await Account.findOne({
      user: req.user.userId,
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Trading account not found",
      });
    }

    return res.status(200).json({
      success: true,
      account,
    });
  } catch (error) {
    console.error("Get Account Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};