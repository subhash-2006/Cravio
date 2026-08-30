import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import userRouter from "./routes/userRoute.js";
import foodRouter from "./routes/foodRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";

// App configuration
const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors());

// DB connection
connectDB();

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API routes
app.use("/api/user", userRouter);
app.use("/api/food", foodRouter);
app.use("/images", express.static(path.join(__dirname, "uploads")));
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

// Health check
app.get("/", (req, res) => {
  res.send("🍅 Tomato Food Delivery API is running!");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
