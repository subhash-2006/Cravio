import foodModel from "../models/foodModel.js";
import fs from "fs";

// Add food item (admin)
const addFood = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload an image for the food item" });
    }

    const { name, description, price, category } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ success: false, message: "Name, price, and category are required" });
    }

    const image_filename = req.file.filename;
    const food = new foodModel({
      name,
      description: description || "",
      price: Number(price),
      category,
      image: image_filename,
    });

    await food.save();
    res.json({ success: true, message: "Food added successfully", data: food });
  } catch (error) {
    console.error("Error adding food:", error);
    res.status(500).json({ success: false, message: "Error adding food: " + error.message });
  }
};

// List all food items
const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({});
    res.json({ success: true, data: foods });
  } catch (error) {
    console.error("Error fetching food list:", error);
    res.status(500).json({ success: false, message: "Error fetching food list" });
  }
};

// Remove food item (admin)
const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id);
    if (!food) {
      return res.status(404).json({ success: false, message: "Food item not found" });
    }

    // Delete image file from uploads folder if it exists
    if (food.image) {
      fs.unlink(`uploads/${food.image}`, (err) => {
        if (err) console.log("Image unlink error or not on disk:", err.message);
      });
    }

    await foodModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Food removed successfully" });
  } catch (error) {
    console.error("Error removing food:", error);
    res.status(500).json({ success: false, message: "Error removing food" });
  }
};

export { addFood, listFood, removeFood };
