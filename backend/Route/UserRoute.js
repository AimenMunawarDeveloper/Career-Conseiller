import express from "express";
import { loginUser, registerUser } from "../Controller/UserController.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);

export default router;
