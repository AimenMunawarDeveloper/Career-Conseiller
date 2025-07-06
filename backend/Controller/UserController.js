import userModel from "../Model/UserModel.js";

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    } else if (user.password != password) {
      return res.status(401).json({ message: "password is incorrect" });
    } else if ((user.password = password)) {
      return res.status(200).json({ message: "login successfully" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "login failed" });
  }
};
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new userModel({ username, email, password });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "User registration failed" });
  }
};
export { loginUser, registerUser };
