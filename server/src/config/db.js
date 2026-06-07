const mongoose = require("mongoose");

const connectDatabase = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    const databaseUri = process.env.MONGODB_URI;

    if (!databaseUri) {
      throw new Error("MONGODB_URI is not configured.");
    }

    await mongoose.connect(databaseUri, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE || 10),
      minPoolSize: Number(process.env.MONGODB_MIN_POOL_SIZE || 2),
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB connected");
    return mongoose.connection;
  } catch (error) {
    console.error("MongoDB connection failed", error.message);
    process.exit(1);
  }
};

module.exports = connectDatabase;
