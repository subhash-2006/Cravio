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

// Database connection
connectDB();

// API routes
app.use("/api/user", userRouter);
app.use("/api/food", foodRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

// Health check
app.get("/", (req, res) => {
  res.send("🍅 Cravio Food Delivery API is running!");
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});