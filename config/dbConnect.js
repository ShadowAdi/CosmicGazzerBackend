import mongoose from "mongoose";
import { configDotenv } from "dotenv";
import { logger } from "../utils/logger.js";
import { AppError } from "../utils/AppError.js";
configDotenv();
export const DBConnect = () => {
  const MONGODB_URL = process.env.MONGODB_URL;
  if (!MONGODB_URL) {
    console.log("MongoDB Url ", MONGODB_URL);
    logger.error("MongoDB Url Do Not Exist " + MONGODB_URL);
    return next(new AppError(`Internal Server Error`, 500));
  }
  try {
    mongoose
      .connect(MONGODB_URL)
      .then(() => {
        logger.info("Database Connected");
      })
      .catch((err) => {
        console.error("Failed to connect database ", err);
        logger.error("Failed to connect Database " + err);
        return;
      });
  } catch (error) {
    console.error("Failed to connect database ", error);
    logger.error("Failed to connect Database " + error);
    return;
  }
};
