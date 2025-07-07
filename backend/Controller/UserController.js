import userModel from "../Model/UserModel.js";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcrypt";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    const match = await bcrypt.compare(password, user.password);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    } else if (!match) {
      return res.status(401).json({ message: "password is incorrect" });
    } else if (match) {
      return res.status(200).json({ message: "login successfully", user });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "login failed" });
  }
};
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new userModel({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully", newUser });
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
    // console.log("ticket", ticket);
    const payload = ticket.payload;
    // console.log("payload", payload);
    const { email, name, picture, sub: googleId } = payload;
    // console.log("email", email);
    // console.log("name", name);
    // console.log("picture", picture);
    // console.log("googleId", googleId);
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
    res.status(200).json({
      message: "Successfully signed in with Google",
      user: {
        id: user._id,
        username: user.username,
        profilePicture: user.profilePicture,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("error", error);
    res.status(401).json({ message: "invalid google credinals" });
  }
};
export { loginUser, registerUser, googleSignIn };
