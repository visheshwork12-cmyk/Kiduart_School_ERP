import mongoose from "mongoose";
import config from "#config/index.js";
import logger from "#config/logger.js";

/**
 * Connect to MongoDB with retry logic
 * @throws {Error} If connection fails
 */
const connectDB = async () => {
  try {
    if (!config.dbUri) {
      throw new Error("MongoDB URI is missing in configuration");
    }
    await mongoose.connect(config.dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info(`✅ MongoDB connected: ${config.dbUri}`);
  } catch (error) {
    logger.error(`❌ MongoDB connection error: ${error.message}`);
    logger.info("Retrying MongoDB connection in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

/**
 * Gracefully disconnect from MongoDB
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info("🛑 MongoDB connection closed");
  } catch (error) {
    logger.error(`MongoDB disconnection error: ${error.message}`);
  }
};

// Log MongoDB connection events
mongoose.connection.on("connected", () => {
  logger.info("MongoDB connection established");
});

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB connection disconnected");
});

mongoose.connection.on("error", (error) => {
  logger.error(`MongoDB connection error: ${error.message}`);
});

// TODO: Add connection pooling configuration for production

export default connectDB;
export { disconnectDB };
