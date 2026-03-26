import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import UserRouter from "../routes/User.js";
import ProductRoutes from "../routes/Products.js";

dotenv.config();

const app = express();

// CORS
app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "API Working 🚀" });
});

// routes
app.use("/api/user", UserRouter);
app.use("/api/products", ProductRoutes);

// Mongo singleton connection
let cached = global.mongoose;

if (!cached) cached = global.mongoose = { conn: null };

async function connectDB() {
  if (cached.conn) return cached.conn;

  cached.conn = await mongoose.connect(process.env.MONGO_DB);
  console.log("Mongo Connected");

  return cached.conn;
}

connectDB().catch(console.error);

export default app;
