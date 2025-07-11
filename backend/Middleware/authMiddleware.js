import { verifyJWTToken } from "../Config/jwt.js";

export const authenticateToken = async (req, res, next) => {
  try {
    const { token } = req.headers.Authorization;
    if (!token) {
      return res.status(401).json({ message: "no token provided" });
    }
    if (!verifyJWTToken(token)) {
      return res.status(403).json({ message: "invalid token" });
    }
    return res.status(200).json({ message: "token is valid" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "unable to authorize user" });
  }
  next();
};
