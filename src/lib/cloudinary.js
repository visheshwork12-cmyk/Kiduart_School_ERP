import { v2 as cloudinary } from "cloudinary";
import logger from "#config/logger.js";

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload file to Cloudinary
const uploadFile = async (file, options = {}) => {
  try {
    if (
      process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "local"
    ) {
      logger.info("Mock Cloudinary upload in dev/local mode");
      return { url: "mock://cloudinary.com/sample.jpg", public_id: "mock_id" }; // Mock response
    }

    // TODO: Implement actual file upload logic
    const result = await cloudinary.uploader.upload(file, {
      ...options,
      // Add specific upload options (e.g., folder, tags) as needed
    });
    logger.info(`File uploaded to Cloudinary: ${result.public_id}`);
    return result;
  } catch (error) {
    logger.error(`Cloudinary upload error: ${error.message}`);
    throw error;
  }
};

export default uploadFile;
