import { UserModel } from "../models/UserSchema.js";
import { AppError } from "../utils/AppError.js";
import { CustomTryCatch } from "../utils/CustomTryCatch.js";
import { isValidGeoPoint } from "../utils/isValidGeoPoint.js";
import { logger } from "../utils/logger.js";
import bcrypt from "bcrypt";

export const CreateUser = CustomTryCatch(async (req, res, next) => {
  const { name, email, password, bio, location } = req.body;

  if (!name || !email || !password || !bio) {
    logger.error(
      `Required Data is not present Email:${email}, name:${name}, password:${password}, bio:${bio}`
    );
    console.log(
      `Required Data is not present Email:${email}, name:${name}, password:${password}, bio:${bio}`
    );
    return next(
      new AppError(
        `Required Data is not present Email:${email}, name:${name}, password:${password}, bio:${bio}`,
        404
      )
    );
  }
  if (!isValidGeoPoint(location)) {
    logger.error(
      `Location is not present in required data: ${location} and type of lang is: ${typeof location
        .coordinates[0]} and type of long is: ${typeof location
        .coordinates[1]} and there values lang: ${
        location.coordinates[0]
      } and long is: ${location.coordinates[1]}`
    );
    console.log(
      `Location is not present in required data: ${location} and type of lang is: ${typeof location
        .coordinates[0]} and type of long is: ${typeof location
        .coordinates[1]} and there values lang: ${
        location.coordinates[0]
      } and long is: ${location.coordinates[1]}`
    );
    return next(
      new AppError(
        `Location is not present in required data: ${location} and type of lang is: ${typeof location
          .coordinates[0]} and type of long is: ${typeof location
          .coordinates[1]} and there values lang: ${
          location.coordinates[0]
        } and long is: ${location.coordinates[1]}`,
        404
      )
    );
  }
  const isUserExist = await UserModel.findOne({ email });

  if (isUserExist) {
    logger.error(`User already exists with the mail: ${email}`);
    return next(
      new AppError(`User already exists with the mail: ${email}`, 404)
    );
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await UserModel({
    name,
    email,
    location,
    bio,
    password: hashedPassword,
  });
  await newUser.save();

  return res.status(201).json({
    statusCode: 201,
    message: "User is created",
    success: true,
  });
});

export const GetAllUsers = CustomTryCatch(async (req, res, next) => {
  const findUsers = await UserModel.find().select("-password");
  if (!findUsers) {
    logger.error(`Failed to get users from db`);
    return next(new AppError(`Failed to get the users from db`, 404));
  }

  return res.status(200).json({
    statusCode: 200,
    message: "All Users have been fetched",
    findUsers: findUsers,
    totalUserCount: findUsers.length,
    success: true,
  });
});

export const GetUser = CustomTryCatch(async (req, res, next) => {
  const userId = req.params.userId;

  if (!userId) {
    logger.error(`Failed to get userId`);
    return next(
      new AppError(
        `User Id is required. For the request user id is not present`,
        404
      )
    );
  }

  const findUser = await UserModel.findById(userId)
    .select("-password")
    .populate({
      path: "savedEvents",
      select:
        "name description type startTime endTime visibilityRegions moonPhase source postedUserId",
      populate: {
        path: "postedUserId",
        select: "name email",
      },
    });

  if (!findUser) {
    logger.error(`Failed to get user from db of id: ${userId}`);
    return next(
      new AppError(`Failed to get the user with the id: ${userId}`, 404)
    );
  }

  return res.status(200).json({
    statusCode: 200,
    message: "User Found",
    findUsers: findUser,
    success: true,
  });
});

export const DeleteUser = CustomTryCatch(async (req, res, next) => {
  const { sub, email } = req.user;
  if (!sub) {
    logger.error(`Failed to get  id from req.user: ${req.user}`);
    return next(
      new AppError(
        `User Id is required. For the request user id is not present`,
        404
      )
    );
  }
  const findUser = await UserModel.findById(sub).select("-password");
  if (!findUser) {
    logger.error(`Failed to get user from db of id: ${sub}`);
    return next(
      new AppError(`Failed to get the user with the id: ${sub}`, 404)
    );
  }

  await UserModel.findByIdAndDelete(sub);

  return res.status(200).json({
    statusCode: 200,
    message: `User with email: ${email} and sub: ${sub} is deleted`,
    success: true,
  });
});

export const UpdateUser = CustomTryCatch(async (req, res, next) => {
  const { sub, email } = req.user;
  if (!sub) {
    logger.error(`Failed to get id from req.user: ${req.user}`);
    return next(
      new AppError(
        `User Id is required. For the request user id is not present`,
        404
      )
    );
  }
  const data = req.body;

  const findUser = await UserModel.findById(sub).select("-password");
  if (!findUser) {
    logger.error(`Failed to get user from db of id: ${sub}`);
    return next(
      new AppError(`Failed to get the user with the id: ${sub}`, 404)
    );
  }

  const updatedUser = await UserModel.findByIdAndUpdate(sub, data, {
    new: true,
    runValidators: true,
  }).select("-password");
  if (!updatedUser) {
    logger.error(
      `Failed to update user with id of ${sub} and updated user is ${updatedUser}`
    );
    return next(
      new AppError(
        `Failed to update user with id of ${sub} and updated user is ${updatedUser}`,
        404
      )
    );
  }

  return res.status(200).json({
    statusCode: 200,
    message: `User with email: ${email} and id: ${sub} is updated`,
    updatedUser,
    success: true,
  });
});
