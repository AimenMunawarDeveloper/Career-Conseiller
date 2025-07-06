import "dotenv/config";
import connectDB from "./Config/db.js";
import express from "express";
import userRoute from "./Route/UserRoute.js";
import cors from "cors";

const app = express();
connectDB();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.use("/api/user", userRoute);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
