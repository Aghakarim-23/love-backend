import User from "../models/User.js";
import mongoose from "mongoose";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    return res.status(200).json(users);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate MongoDB ObjectId
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    // 2. Find user by ID
    const user = await User.findById(id).select("-password");

    // 3. Check if user exists
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 4. Return user
    return res.status(200).json(user);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};