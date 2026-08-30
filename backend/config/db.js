import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`\n❌ MongoDB connection error: ${error.message}`);
    console.error(`\n💡 Common fixes:`);
    console.error(`   1. Whitelist your IP in MongoDB Atlas → Network Access`);
    console.error(`   2. Check your MONGODB_URI in .env is correct`);
    console.error(`   3. Check your internet connection\n`);
    process.exit(1);
  }
};

export default connectDB;
