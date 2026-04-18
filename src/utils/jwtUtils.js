import jwt from "jsonwebtoken";

export const signToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

export const signRefreshToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN
    });

};
// VERIFY TOKEN
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
// VERIFY REFRESH TOKEN
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};