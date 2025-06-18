import { UserModel } from "../models/UserSchema.js";
import { AppError } from "../utils/AppError.js";
import { CustomTryCatch } from "../utils/CustomTryCatch.js";
import { logger } from "../utils/logger.js";
import bcrypt from "bcrypt";
import { configDotenv } from "dotenv";
import { TokenGenerator } from "../utils/TokenGenerator.js";
configDotenv();

export const LoginUser = CustomTryCatch(async (req, res, next) => {
  const data = req.body;
  const { email, password } = data;
  if (!email || !password) {
    logger.error(
      `Required Data is not present Email:${email}, password:${password}, `
    );
    console.log(
      `Required Data is not present Email:${email}, password:${password}`
    );
    return next(
      new AppError(
        `Required Data is not present Email:${email}, password:${password}`,
        404
      )
    );
  }
  const isUserExist = await UserModel.findOne({ email });
  if (!isUserExist) {
    logger.error(`Failed to get user with email: ${email}`);
    return next(
      new AppError(`Failed to get the user with the email: ${email}`, 404)
    );
  }
  const isPasswordCorrect = bcrypt.compare(password, isUserExist.password);
  if (!isPasswordCorrect) {
    logger.error(
      `Invalid Credentails email: ${email} and password: ${password}`
    );
    return next(
      new AppError(
        `Invalid Credentails email: ${email} and password: ${password}`,
        404
      )
    );
  }
  const payload = {
    email: isUserExist.email,
    sub: isUserExist._id,
  };
  const token =await TokenGenerator(payload);
  return res.status(200).json({
    success: true,
    statusCode: 200,
    user: isUserExist,
    token,
  });
});

export const AuthenticatedUser = CustomTryCatch(async (req, res, next) => {
  const user = req.user;
  if (!user) {
    logger.error(`Failed to get the authenticated user ${user}`);
    console.log(`Failed to get the authenticated user ${user}`);
    return next(
      new AppError(`Failed to get the authenticated user ${user}`, 404)
    );
  }
  logger.info("Authenticated User ", user);
  const { email, sub } = user;
  if (!sub) {
    logger.error(`Failed to get the authenticated user ${sub}`);
    console.log(`Failed to get the authenticated user ${sub}`);
    return next(
      new AppError(`Failed to get the authenticated user ${sub}`, 404)
    );
  }
  const userFound = await UserModel.findById(sub).select("-password");
  if (!userFound) {
    logger.error(`User With Id Do Not Exist: ${sub}`);
    console.log(`User With Id Do Not Exist: ${sub}`);
    return next(new AppError(`User With Id Do Not Exist: ${sub}`, 404));
  }
  if (userFound.email !== email) {
    logger.error(`User With email Do Not Exist: ${email}`);
    console.log(`User With email Do Not Exist: ${email}`);
    return next(new AppError(`User With email Do Not Exist: ${email}`, 404));
  }
  return res.status(200).json({
    statusCode: 200,
    user: userFound,
    message: "User Found",
    success: true,
  });
});
