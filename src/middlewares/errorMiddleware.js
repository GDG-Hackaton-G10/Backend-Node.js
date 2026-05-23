import AppError from "../utils/appError.js";
import { sendError } from "../utils/responseFormatter.js";

const defaultErrorCode = (statusCode) => {
  switch (statusCode) {
    case 400:
      return "BAD_REQUEST";
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 409:
      return "CONFLICT";
    default:
      return "INTERNAL_SERVER_ERROR";
  }
};

export const notFound = (req, res, next) => {
  next(new AppError(`Route not found - ${req.originalUrl}`, 404, "ROUTE_NOT_FOUND"));
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || defaultErrorCode(statusCode);
  const message = err.message || "Server error";

  if (res.headersSent) {
    return next(err);
  }

  return sendError(res, message, code, statusCode);
};
