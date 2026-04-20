import AppError from "../utils/appError.js";
import { sendError } from "../utils/responseFormatter.js";

export const notFound = (req, res, next) => {
  next(new AppError(`Route not found - ${req.originalUrl}`, 404, "ROUTE_NOT_FOUND"));
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || "INTERNAL_SERVER_ERROR";
  const message = err.message || "Server error";

  if (res.headersSent) {
    return next(err);
  }

  return sendError(res, message, code, statusCode);
};
