import express from "express";
import {
  loginUser,
  registerUser,
  googleSignIn,
} from "../Controller/UserController.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/google-signin", googleSignIn);

export default router;
