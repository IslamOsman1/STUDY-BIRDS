const mongoose = require("mongoose");

const connectDatabase = async () => {
  try {
    const databaseUri = process.env.MONGODB_URI;

    if (!databaseUri) {
      throw new Error("MONGODB_URI is not configured.");
    }

    await mongoose.connect(databaseUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed", error.message);
    process.exit(1);
  }
};

module.exports = connectDatabase;
