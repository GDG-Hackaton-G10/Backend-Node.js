import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/appError.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("Not authorized, no token", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    req.user = user;
    next();
  } catch (err) {
    return next(new AppError("Invalid or expired token", 401));
  }
};

// ROLE BASED ACCESS
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Not authenticated", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError("Access denied", 403));
    }

    next();
  };
};