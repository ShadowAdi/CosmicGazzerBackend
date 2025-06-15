import { ReminderModel } from "../models/ReminderSchema.js";
import { AppError } from "../utils/AppError.js";
import { CustomTryCatch } from "../utils/CustomTryCatch.js";
import { logger } from "../utils/logger.js";

export const GetAllNotification = CustomTryCatch(async (req, res, next) => {
  const { sub } = req.body;
  if (!sub) {
    logger.error(`Failed to get id from req.user: ${req.user}`);
    return next(
      new AppError(
        `User Id is required. For the request user id is not present`,
        404
      )
    );
  }
  const getNotifications = await ReminderModel.find({ userId: sub });
  return res.status(200).json({
    getNotifications,
    statusCode: 200,
    success: true,
    message: "All Notification Fetched",
  });
});

export const GetAllNotificationBasedOnUser = CustomTryCatch(
  async (req, res, next) => {
    const { sub } = req.body;
    const eventId = req.query.eventId;
    if (!sub) {
      logger.error(`Failed to get id from req.user: ${req.user}`);
      return next(
        new AppError(
          `User Id is required. For the request user id is not present`,
          404
        )
      );
    }
    if (!eventId) {
      logger.error(`Failed to get event Id: ${eventId}`);
      return next(
        new AppError(
          `Event Id Is Not Given so not able to fetch the event`,
          404
        )
      );
    }
    const getNotifications = await ReminderModel.find({ eventId: eventId });
    return res.status(200).json({
      getNotifications,
      statusCode: 200,
      success: true,
      message: "All Notification Fetched",
    });
  }
);
