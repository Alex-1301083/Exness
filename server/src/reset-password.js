import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "./models/User.js";

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const email = "prince123@gmail.com";

    // Yahan apna NEW password set karo
    const newPassword = "Prince@123";

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      console.log("❌ User not found");
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    user.password = hashedPassword;

    await user.save();

    console.log("✅ Password reset successful");
    console.log("Email:", email);
    console.log("New password:", newPassword);

    await mongoose.disconnect();

    process.exit(0);
  } catch (error) {
    console.error("❌ Password reset failed:", error);

    await mongoose.disconnect();

    process.exit(1);
  }
};

resetPassword();