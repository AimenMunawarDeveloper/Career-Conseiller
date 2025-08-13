import userModel from "../Model/UserModel.js";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcrypt";
import { generateJWTToken } from "../Config/jwt.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const loginUser = async (req, res) => {
  try {
    console.log("Login request received:", { email: req.body.email });
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log("Missing login fields:", {
        email: !!email,
        password: !!password,
      });
      return res.status(400).json({
        message: "Email and password are required",
        missing: {
          email: !email,
          password: !password,
        },
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      console.log("User not found:", email);
      return res.status(404).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log("Password incorrect for:", email);
      return res.status(401).json({ message: "Password is incorrect" });
    }

    // Generate JWT token
    const token = generateJWTToken({
      id: user._id,
      email: user.email,
      username: user.username,
    });

    console.log("Login successful for:", email);
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

const registerUser = async (req, res) => {
  try {
    console.log("Registration request received:", req.body);
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      console.log("Missing required fields:", {
        username: !!username,
        email: !!email,
        password: !!password,
      });
      return res.status(400).json({
        message: "All fields are required",
        missing: {
          username: !username,
          email: !email,
          password: !password,
        },
      });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      console.log("User already exists:", email);
      return res
        .status(400)
        .json({ message: "An account with this email already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new userModel({
      username,
      email,
      password: hashedPassword,
    });

    console.log("Saving new user:", { username, email });
    await newUser.save();
    console.log("User saved successfully");

    // Generate JWT token
    const token = generateJWTToken({
      id: newUser._id,
      email: newUser.email,
      username: newUser.username,
    });

    console.log("Registration successful for:", email);
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
      },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "User registration failed",
      error: error.message,
    });
  }
};

const googleSignIn = async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.payload;
    const { email, name, picture, sub: googleId } = payload;

    let user = await userModel.findOne({ email });
    if (!user) {
      const saltRounds = 10;
      const password = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      user = await new userModel({
        username: name,
        email,
        profilePicture: picture,
        password: hashedPassword,
      });
      await user.save();
    }

    // Generate JWT token
    const token = generateJWTToken({
      id: user._id,
      email: user.email,
      username: user.username,
    });

    res.status(200).json({
      message: "Successfully signed in with Google",
      user: {
        id: user._id,
        username: user.username,
        profilePicture: user.profilePicture,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.log("error", error);
    res.status(401).json({ message: "invalid google credentials" });
  }
};

export { loginUser, registerUser, googleSignIn };
