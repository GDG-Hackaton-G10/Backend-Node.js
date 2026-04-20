export const sendSuccess = (res, data, messageOrStatusCode = 200, statusCode) => {
  let message = null;
  let resolvedStatusCode = 200;

  if (typeof messageOrStatusCode === "number") {
    resolvedStatusCode = messageOrStatusCode;
  } else {
    message = messageOrStatusCode;
    resolvedStatusCode = typeof statusCode === "number" ? statusCode : 200;
  }

  const payload = {
    success: true,
    data,
  };

  if (message !== null && message !== undefined) {
    payload.message = message;
  }

  res.status(resolvedStatusCode).json(payload);
};

export const sendError = (res, message, code, statusCode = 400) => {
  res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
};
