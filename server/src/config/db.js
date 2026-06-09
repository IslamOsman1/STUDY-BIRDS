const mongoose = require("mongoose");

let connectionPromise = null;

const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  const databaseUri = process.env.MONGODB_URI;

  if (!databaseUri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  connectionPromise = mongoose
    .connect(databaseUri, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE || 10),
      minPoolSize: Number(process.env.MONGODB_MIN_POOL_SIZE || 2),
      socketTimeoutMS: 45000,
    })
    .then(() => {
      console.log("MongoDB connected");
      return mongoose.connection;
    })
    .catch((error) => {
      connectionPromise = null;
      throw error;
    });

  return connectionPromise;
};

const isDatabaseReady = () => mongoose.connection.readyState === 1;

mongoose.connection.on("disconnected", () => {
  connectionPromise = null;
  console.warn("MongoDB disconnected");
});

module.exports = {
  connectDatabase,
  isDatabaseReady,
};
