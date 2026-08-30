import express from "express";
import { addFood, listFood, removeFood } from "../controllers/foodController.js";
import multer from "multer";

const foodRouter = express.Router();

// Store uploaded image temporarily in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Add food
foodRouter.post("/add", upload.single("image"), addFood);

// List food
foodRouter.get("/list", listFood);

// Remove food
foodRouter.post("/remove", removeFood);

export default foodRouter;