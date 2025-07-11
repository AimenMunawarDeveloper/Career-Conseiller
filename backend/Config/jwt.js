import jwt from "jsonwebtoken";

export const generateJWTToken = (payload) => {
  return jwt.sign({ payload }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPRIES_IN,
  });
};
export const verifyJWTToken = (token) => {
  return jwt.verify({ token }, process.env.JWT_SECRET);
};
