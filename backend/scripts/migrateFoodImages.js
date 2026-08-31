import "dotenv/config";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import foodModel from "../models/foodModel.js";
import cloudinary from "../config/cloudinary.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "uploads");

const uploadImage = (filePath) => {
  return new Promise((resolve, reject) => {
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

    fs.createReadStream(filePath).pipe(uploadStream);
  });
};

try {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected.");

  const foods = await foodModel.find({});

  console.log(`Found ${foods.length} food items.`);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const food of foods) {
    console.log(`\nProcessing: ${food.name}`);
    console.log(`Current image: ${food.image}`);

    // Already migrated to Cloudinary
    if (food.image && food.image.startsWith("http")) {
      console.log("Already using Cloudinary. Skipping.");
      skipped++;
      continue;
    }

    if (!food.image) {
      console.log("No image filename found. Skipping.");
      skipped++;
      continue;
    }

    const filePath = path.join(uploadsDir, food.image);

    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      failed++;
      continue;
    }

    try {
      console.log("Uploading to Cloudinary...");

      const result = await uploadImage(filePath);

      await foodModel.findByIdAndUpdate(food._id, {
        image: result.secure_url,
      });

      console.log("Uploaded successfully.");
      console.log(`Cloudinary URL: ${result.secure_url}`);

      uploaded++;
    } catch (error) {
      console.error("Upload failed:", error.message);
      failed++;
    }
  }

  console.log("\n==============================");
  console.log("Migration completed");
  console.log("==============================");
  console.log(`Uploaded: ${uploaded}`);
  console.log(`Skipped:  ${skipped}`);
  console.log(`Failed:   ${failed}`);
  console.log("==============================");

  await mongoose.disconnect();
  console.log("MongoDB disconnected.");
} catch (error) {
  console.error("Migration error:", error);
  process.exit(1);
}