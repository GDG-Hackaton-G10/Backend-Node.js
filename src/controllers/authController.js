import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import {
  signToken,
  signRefreshToken,
  verifyToken,
} from "../utils/jwtUtils.js";
import { sendSuccess, sendError } from "../utils/responseFormatter.js";
import AppError from "../utils/appError.js";

const sanitizeUser = (user) => {
  const userObject = user.toObject ? user.toObject() : { ...user };
  delete userObject.password;
  delete userObject.refreshToken;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  return userObject;
};

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
      { user: sanitizeUser(user), accessToken, refreshToken },
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
      { user: sanitizeUser(user), accessToken, refreshToken },
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

export const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    return sendSuccess(
      res,
      { resetToken },
      'Password reset token generated successfully'
    );
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return next(new AppError('Invalid or expired reset token', 400));
    }

    user.password = await bcrypt.hash(password, 10);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.refreshToken = null;
    await user.save();

    return sendSuccess(res, null, 'Password reset successful');
  } catch (err) {
    next(err);
  }
};

export const createStaffUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!['pharmacy', 'admin'].includes(role)) {
      return next(new AppError('Role must be pharmacy or admin', 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return next(new AppError('User already exists', 400));

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    return sendSuccess(res, sanitizeUser(user), 'Staff user created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password -refreshToken -passwordResetToken -passwordResetExpires');
    return sendSuccess(res, users, 200);
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
      updates.refreshToken = null;
    }

    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select('-password -refreshToken -passwordResetToken -passwordResetExpires');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    return sendSuccess(res, user, 'User updated successfully');
  } catch (err) {
    next(err);
  }
};