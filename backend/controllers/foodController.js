import foodModel from "../models/foodModel.js";
import cloudinary from "../config/cloudinary.js";

// Add food item (admin)
const addFood = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image for the food item",
      });
    }

    const { name, description, price, category } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, price, and category are required",
      });
    }

    // Upload image to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "cravio-food",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(req.file.buffer);
    });

    // Save Cloudinary URL in MongoDB
    const food = new foodModel({
      name: name.trim(),
      description: description?.trim() || "",
      price: Number(price),
      category,
      image: uploadResult.secure_url,
    });

    await food.save();

    res.json({
      success: true,
      message: "Food added successfully",
      data: food,
    });
  } catch (error) {
    console.error("Error adding food:", error);

    res.status(500).json({
      success: false,
      message: "Error adding food: " + error.message,
    });
  }
};

// List all food items
const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({});

    res.json({
      success: true,
      data: foods,
    });
  } catch (error) {
    console.error("Error fetching food list:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching food list",
    });
  }
};

// Remove food item
const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    // Delete from Cloudinary if the image is stored there
    if (food.image && food.image.includes("cloudinary.com")) {
      try {
        const urlParts = food.image.split("/");
        const filename = urlParts[urlParts.length - 1];
        const publicId = filename.substring(0, filename.lastIndexOf("."));

        await cloudinary.uploader.destroy(`cravio-food/${publicId}`);
      } catch (error) {
        console.error("Cloudinary delete error:", error.message);
      }
    }

    await foodModel.findByIdAndDelete(req.body.id);

    res.json({
      success: true,
      message: "Food removed successfully",
    });
  } catch (error) {
    console.error("Error removing food:", error);

    res.status(500).json({
      success: false,
      message: "Error removing food",
    });
  }
};

export { addFood, listFood, removeFood };