import userModel from "../Model/UserModel.js";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcrypt";
import { generateJWTToken } from "../Config/jwt.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "password is incorrect" });
    }

    // Generate JWT token
    const token = generateJWTToken({
      id: user._id,
      email: user.email,
      username: user.username,
    });

    return res.status(200).json({
      message: "login successfully",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "login failed" });
  }
};

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new userModel({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    // Generate JWT token
    const token = generateJWTToken({
      id: newUser._id,
      email: newUser.email,
      username: newUser.username,
    });

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
    res.status(500).json({ message: "User registration failed" });
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
