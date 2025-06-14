import { configDotenv } from "dotenv";
import { logger } from "./logger.js";
import { AppError } from "./AppError.js";
import jwt from "jsonwebtoken";

configDotenv();
export const TokenGenerator = async (payload) => {
  try {
    const Jwt_Secret = process.env.JWT_SECRET_KEY;
    if (!Jwt_Secret) {
      console.log("Jwt Secret Key is not found ", Jwt_Secret);
      logger.error("Jwt Secret Key is not found " + Jwt_Secret);
      return next(new AppError(`Internal Server Error`, 500));
    }
    const token = jwt.sign(payload, Jwt_Secret, {
      algorithm: "HS256",
      expiresIn: "7d",
    });
    return token;
  } catch (error) {
    console.log("Some Error in creating Token ", error);
    logger.error("Error in creating Token  " + error);
    return next(new AppError(`Internal Server Error`, 500));
  }
};
