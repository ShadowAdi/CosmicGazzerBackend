import { EventModel } from "../models/EventSchema.js";
import { UserModel } from "../models/UserSchema.js";
import { PostModel } from "../models/PostSchema.js";
import { CustomTryCatch } from "../utils/CustomTryCatch.js";
import { logger } from "../utils/logger.js";

export const CreateEvent = CustomTryCatch(async (req, res, next) => {
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
  const {
    name,
    description,
    type,
    startTime,
    endTime,
    visibilityRegions,
    moonPhase,
    source,
  } = data;

  if (!name || !startTime || !endTime) {
    logger.error(
      `Missing event data. name: ${name}, startTime: ${startTime}, endTime: ${endTime}`
    );
    return next(
      new AppError(
        `Name, start time and end time are required to create an event`,
        400
      )
    );
  }

  const findUser = await UserModel.findById(sub).select("-password");
  if (!findUser) {
    logger.error(`Failed to get user from db of id: ${sub}`);
    return next(
      new AppError(
        `Failed to get the user with the id: ${sub} and email: ${email}`,
        404
      )
    );
  }

  // Check if event with same name already exists
  const isAlreadyExist = await EventModel.findOne({ name });
  if (isAlreadyExist) {
    logger.error(`Event with name: ${name} already exists`);
    return next(new AppError(`Event with name: ${name} already exists`, 409));
  }

  const createEvent = new EventModel({
    name,
    description,
    type,
    startTime,
    endTime,
    visibilityRegions,
    moonPhase,
    source,
    postedUserId: sub,
  });

  await createEvent.save();
  return res.status(201).json({
    statusCode: 201,
    message: "Event is created successfully",
    createEvent,
    success: true,
  });
});

export const GetAllEvents = CustomTryCatch(async (req, res, next) => {
  const { type, region, upcoming, startDate, endDate, limit } = req.query;
  let query = {};
  let sortOptions = { createdAt: -1 };

  if (type) {
    const validTypes = ["Meteor Shower", "ISS Pass", "Lunar Eclipse"];
    if (!validTypes.includes(type)) {
      logger.error(`Invalid event type: ${type}`);
      return next(
        new AppError(
          `Invalid event type. Valid types are: ${validTypes.join(", ")}`,
          400
        )
      );
    }
    query.type = type;
  }

  if (region) {
    query.visibilityRegions = { $in: [region] };
  }


  if (upcoming === "true") {
    const currentTime = new Date();
    query.startTime = { $gte: currentTime };
    sortOptions = { startTime: 1 };
  }

  if (startDate || endDate) {
    if (!startDate || !endDate) {
      logger.error(
        `Both start date and end date are required for date range filtering`
      );
      return next(
        new AppError(
          `Both startDate and endDate are required for date range filtering`,
          400
        )
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      logger.error(`Invalid date format`);
      return next(
        new AppError(`Invalid date format. Use YYYY-MM-DD format`, 400)
      );
    }

    if (start > end) {
      logger.error(`Start date cannot be after end date`);
      return next(new AppError(`Start date cannot be after end date`, 400));
    }

    query.$or = [
      { startTime: { $gte: start, $lte: end } },
      { endTime: { $gte: start, $lte: end } },
      { startTime: { $lte: start }, endTime: { $gte: end } },
    ];
    sortOptions = { startTime: 1 };
  }

  const events = await EventModel.find(query)
    .sort(sortOptions)
    .limit(limit)
    .populate("postedUserId", "name email bio");
  let message = "All Events Fetched";
  if (type) message = `All ${type} events fetched`;
  if (region) message = `Events visible in ${region} fetched`;
  if (upcoming === "true") message = "Upcoming Events Fetched";
  if (startDate && endDate) message = "Events in date range fetched";

  return res.status(200).json({
    statusCode: 200,
    message,
    events,
    success: true,
    count: events.length,
    filters: {
      type: type || null,
      region: region || null,
      upcoming: upcoming === "true" || false,
      dateRange: startDate && endDate ? { startDate, endDate } : null,
      limit: limit,
    },
  });
});

export const GetEventsByUser = CustomTryCatch(async (req, res, next) => {
  const userId = req.params.userId;

  const findUser = await UserModel.findById(userId);
  if (!findUser) {
    logger.error(`Failed to get user from db of id: ${userId}`);
    return next(
      new AppError(`Failed to get the user with the id: ${userId}`, 404)
    );
  }

  const events = await EventModel.find({ postedUserId: userId }).populate(
    "postedUserId",
    "name email bio"
  );

  return res.status(200).json({
    statusCode: 200,
    message: "User events fetched",
    events,
    success: true,
    count: events.length,
  });
});

export const GetEvent = CustomTryCatch(async (req, res, next) => {
  const eventId = req.params.eventId;

  const findEvent = await EventModel.findById(eventId).populate(
    "postedUserId",
    "name email bio _id"
  );
  if (!findEvent) {
    logger.error(`Failed to get event from db of id: ${eventId}`);
    return next(
      new AppError(`Failed to get the event with the id: ${eventId}`, 404)
    );
  }

  return res.status(200).json({
    statusCode: 200,
    message: "Event Found",
    findEvent,
    success: true,
  });
});

export const UpdateEvent = CustomTryCatch(async (req, res, next) => {
  const eventId = req.params.eventId;
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
      new AppError(
        `Failed to get the user with the id: ${sub} and email: ${email}`,
        404
      )
    );
  }

  const isAlreadyEvent = await EventModel.findById(eventId);
  if (!isAlreadyEvent) {
    logger.error(`Event with Id: ${eventId} does not exist`);
    return next(new AppError(`Event with Id: ${eventId} does not exist`, 404));
  }

  // Check if user is authorized to update this event
  if (isAlreadyEvent.postedUserId.toString() !== sub) {
    logger.error(`User ${sub} not authorized to update event ${eventId}`);
    return next(
      new AppError(`You are not authorized to update this event`, 403)
    );
  }

  // If updating name, check for uniqueness
  if (data.name && data.name !== isAlreadyEvent.name) {
    const nameExists = await EventModel.findOne({ name: data.name });
    if (nameExists) {
      logger.error(`Event with name: ${data.name} already exists`);
      return next(
        new AppError(`Event with name: ${data.name} already exists`, 409)
      );
    }
  }

  const updatedEvent = await EventModel.findByIdAndUpdate(eventId, data, {
    new: true,
  }).populate("postedUserId", "name email bio");

  if (!updatedEvent) {
    logger.error(`Failed to update the event of id: ${eventId}`);
    return next(
      new AppError(`Failed to update the event of id: ${eventId}`, 404)
    );
  }

  return res.status(200).json({
    statusCode: 200,
    message: "Event Updated Successfully",
    updatedEvent,
    success: true,
  });
});

export const DeleteEvent = CustomTryCatch(async (req, res, next) => {
  const eventId = req.params.eventId;
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

  const findUser = await UserModel.findById(sub).select("-password");
  if (!findUser) {
    logger.error(`Failed to get user from db of id: ${sub}`);
    return next(
      new AppError(
        `Failed to get the user with the id: ${sub} and email: ${email}`,
        404
      )
    );
  }

  const isAlreadyEvent = await EventModel.findById(eventId);
  if (!isAlreadyEvent) {
    logger.error(`Event with Id: ${eventId} does not exist`);
    return next(new AppError(`Event with Id: ${eventId} does not exist`, 404));
  }

  // Check if user is authorized to delete this event
  if (isAlreadyEvent.postedUserId.toString() !== sub) {
    logger.error(`User ${sub} not authorized to delete event ${eventId}`);
    return next(
      new AppError(`You are not authorized to delete this event`, 403)
    );
  }

  // Check if there are posts associated with this event
  const associatedPosts = await PostModel.find({ eventId });
  if (associatedPosts.length > 0) {
    logger.error(`Cannot delete event ${eventId} - has associated posts`);
    return next(
      new AppError(
        `Cannot delete event - there are ${associatedPosts.length} posts associated with this event`,
        400
      )
    );
  }

  const deletedEvent = await EventModel.findByIdAndDelete(eventId);
  if (!deletedEvent) {
    logger.error(`Failed to delete the event of id: ${eventId}`);
    return next(
      new AppError(`Failed to delete the event of id: ${eventId}`, 404)
    );
  }

  return res.status(200).json({
    statusCode: 200,
    message: "Event Deleted Successfully",
    deletedEvent,
    success: true,
  });
});

export const AuthenticatedUserEvents = CustomTryCatch(
  async (req, res, next) => {
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

    const findUser = await UserModel.findById(sub).select("-password");
    if (!findUser) {
      logger.error(`Failed to get user from db of id: ${sub}`);
      return next(
        new AppError(
          `Failed to get the user with the id: ${sub} and email: ${email}`,
          404
        )
      );
    }

    const eventsFound = await EventModel.find({ postedUserId: sub }).populate(
      "postedUserId",
      "name email bio"
    );

    return res.status(200).json({
      statusCode: 200,
      message: "User Events Fetched Successfully",
      eventsFound,
      success: true,
      count: eventsFound.length,
    });
  }
);
