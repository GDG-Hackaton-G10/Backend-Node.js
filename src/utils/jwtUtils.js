import jwt from "jsonwebtoken";

const verifyWithFallbackSecrets = (token, secrets) => {
  let lastError;

  for (const secret of secrets.filter(Boolean)) {
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Token secret is not configured");
};

export const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const signRefreshToken = (id) => {
  return jwt.sign(
    { id, type: "refresh" },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export const verifyRefreshToken = (token) => {
  return verifyWithFallbackSecrets(token, [
    process.env.JWT_REFRESH_SECRET,
    process.env.JWT_SECRET,
  ]);
};
