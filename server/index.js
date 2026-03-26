import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import UserRouter from "../routes/User.js";
import ProductRoutes from "../routes/Products.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// routes
app.get("/", (req, res) => {
  res.status(200).json({
    message: "API Working 🚀",
  });
});

app.use("/api/user", UserRouter);
app.use("/api/products", ProductRoutes);

// error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

// Mongo connection
mongoose.set("strictQuery", true);

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  const db = await mongoose.connect(
    process.env.MONGO_DB || process.env.MODNO_DB
  );

  isConnected = db.connections[0].readyState;
  console.log("Mongo Connected");
};

await connectDB();

export default app;