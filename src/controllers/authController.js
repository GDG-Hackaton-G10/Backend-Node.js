import bcrypt from "bcryptjs";
import User from "../models/User.js";
import {
  signToken,
  signRefreshToken,
  verifyToken,
} from "../utils/jwtUtils.js";
import { sendSuccess, sendError } from "../utils/responseFormatter.js";
import AppError from "../utils/appError.js";

// REGISTER
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return next(new AppError("User already exists", 400));

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    const accessToken = signToken(user._id, user.role);
    const refreshToken = signRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    return sendSuccess(
      res,
      { user, accessToken, refreshToken },
      "User registered successfully",
      201
    );
  } catch (err) {
    next(err);
  }
};

// LOGIN
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return next(new AppError("Invalid credentials", 401));

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return next(new AppError("Invalid credentials", 401));

    const accessToken = signToken(user._id, user.role);
    const refreshToken = signRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    return sendSuccess(
      res,
      { user, accessToken, refreshToken },
      "Login successful"
    );
  } catch (err) {
    next(err);
  }
};

// REFRESH TOKEN
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError("Refresh token required", 400));
    }

    const decoded = verifyToken(refreshToken);

    if (decoded.type !== "refresh") {
      return next(new AppError("Invalid token type", 401));
    }

    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return next(new AppError("Invalid refresh token", 403));
    }

    const newAccessToken = signToken(user._id, user.role);

    return sendSuccess(
      res,
      { accessToken: newAccessToken },
      "Token refreshed"
    );
  } catch (err) {
    next(new AppError("Invalid or expired refresh token", 401));
  }
};

// LOGOUT
export const logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    return sendSuccess(res, null, "Logged out successfully");
  } catch (err) {
    next(err);
  }
};