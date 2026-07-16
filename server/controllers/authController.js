import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateJwtToken } from "../utils/token.js";
import { sendError } from "../utils/responses.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if all fields are provided
    if (!name || !email || !password || !phone) {
      return sendError(res, 400, "All fields are required");
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return sendError(res, 400, "User already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userResponse,
    });

  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return sendError(res, 400, "Email and password are required");
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return sendError(res, 401, "Invalid email or password");
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return sendError(res, 401, "Invalid email or password");
    }

    const token = generateJwtToken(user);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userResponse,
    });

  } catch (error) {
    return sendError(res, 500, error.message);
  }
};