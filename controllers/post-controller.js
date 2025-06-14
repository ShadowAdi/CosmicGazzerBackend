import { EventModel } from "../models/EventSchema.js";
import { PostModel } from "../models/PostSchema.js";
import { UserModel } from "../models/UserSchema.js";
import { AppError } from "../utils/AppError.js";
import { CustomTryCatch } from "../utils/CustomTryCatch.js";
import { logger } from "../utils/logger.js";

export const CreatePost = CustomTryCatch(async (req, res) => {
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
  const eventId = req.params.eventId;
  const data = req.body;
  const { imageUrl, caption, location, visibilityScore } = data;

  if (!imageUrl || !caption || !location || !visibilityScore) {
    logger.error(
      `Missing post data. imageUrl: ${imageUrl}, caption: ${caption}`
    );
    return next(new AppError(`All fields are required to create a post`, 400));
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

  const findEvent = await EventModel.findById(eventId);
  if (!findEvent) {
    logger.error(`Failed to get event from db of id: ${eventId}`);
    return next(
      new AppError(`Failed to get the event with the id: ${eventId}`, 404)
    );
  }

  const isAlreadyExist = await PostModel.findOne({
    userId: sub,
    eventId: eventId,
  });

  if (isAlreadyExist) {
    logger.error(
      `For this user: ${userId} one post already Exists for this event: ${eventId}`
    );
    return next(
      new AppError(
        `For this user: ${userId} one post already Exists for this event: ${eventId}`,
        404
      )
    );
  }

  const createPost = new PostModel({
    imageUrl,
    caption,
    location,
    visibilityScore,
    userId: sub,
    eventId: eventId,
  });

  await createPost.save();
  return res.status(201).json({
    statusCode: 201,
    message: "Post is created",
    createPost,
    success: true,
  });
});

export const GetAllPosts = CustomTryCatch(async (req, res) => {
  const posts = await PostModel.find().populate("userId", "name email bio");

  return res.status(200).json({
    statusCode: 200,
    message: "All Post Fetched",
    posts,
    success: true,
  });
});

export const GetPostBasedOnEvent = CustomTryCatch(async (req, res) => {
  const eventId = req.params.eventId;

  const findEvent = await EventModel.findById(eventId);
  if (!findEvent) {
    logger.error(`Failed to get event from db of id: ${eventId}`);
    return next(
      new AppError(`Failed to get the event with the id: ${eventId}`, 404)
    );
  }
  const posts = await PostModel.find({ eventId })
    .populate("userId", "name email bio")
    .populate("eventId", "name type startTime endTime moonPhase");

  return res.status(200).json({
    statusCode: 200,
    message: "All Post Fetched",
    posts,
    success: true,
  });
});

export const GetPostBasedOnUser = CustomTryCatch(async (req, res, next) => {
  const userId = req.params.userId;

  const findUser = await UserModel.findById(userId);
  if (!findUser) {
    logger.error(`Failed to get user from db of id: ${userId}`);
    return next(
      new AppError(`Failed to get the user with the id: ${userId}`, 404)
    );
  }
  const posts = await PostModel.find({ userId })
    .populate("userId", "name email bio")
    .populate("eventId", "name type startTime endTime moonPhase");

  return res.status(200).json({
    statusCode: 200,
    message: "All Post Fetched",
    posts,
    success: true,
  });
});

export const GetPost = CustomTryCatch(async (req, res) => {
  const postId = req.params.postId;

  const findPost = await PostModel.findById(postId).populate(
    "userId name email bio _id",
    "eventId title type _id startTime endTime visibilityScore"
  );
  if (!findPost) {
    logger.error(`Failed to get post from db of id: ${postId}`);
    return next(
      new AppError(`Failed to get the post with the id: ${postId}`, 404)
    );
  }

  return res.status(200).json({
    statusCode: 200,
    message: "Post Found",
    findPost,
    success: true,
  });
});

export const UpdatePost = CustomTryCatch(async (req, res) => {
  const postId = req.params.postId;
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

  const isAlreadyPost = await PostModel.findById(postId);

  if (!isAlreadyPost) {
    logger.error(`Post with Id: ${postId} do not exists`);
    return next(new AppError(`Post with Id: ${postId} do not exists`, 404));
  }

  const updatedPost = await PostModel.findByIdAndUpdate(postId, data, {
    new: true,
  });

  if (!updatedPost) {
    logger.error(`Failed to update the post of id: ${postId}`);
    return next(
      new AppError(`Failed to update the post of id: ${postId}`, 404)
    );
  }

  return res.status(200).json({
    statusCode: 200,
    message: "Post Updated",
    updatedPost,
    success: true,
  });
});

export const DeletedPost = CustomTryCatch(async (req, res) => {
  const postId = req.params.postId;
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

  const isAlreadyPost = await PostModel.findById(postId);

  if (!isAlreadyPost) {
    logger.error(`Post with Id: ${postId} do not exists`);
    return next(new AppError(`Post with Id: ${postId} do not exists`, 404));
  }

  const deletedPost = await PostModel.findByIdAndDelete(postId, data);

  if (!deletedPost) {
    logger.error(`Failed to delete the post of id: ${postId}`);
    return next(
      new AppError(`Failed to delete the post of id: ${postId}`, 404)
    );
  }

  return res.status(200).json({
    statusCode: 200,
    message: "Post Deleted",
    deletedPost,
    success: true,
  });
});

export const AuthenticatedUserPosts = CustomTryCatch(async (req, res, next) => {
  const { sub, email } = req.user;

  if (!sub) {
    logger.error(`Failed to get id from req.user: ${JSON.stringify(req.user)}`);
    return next(
      new AppError(
        `User ID is required. The request did not contain a valid user.`,
        404
      )
    );
  }

  const findUser = await UserModel.findById(sub).select("-password");
  if (!findUser) {
    logger.error(`Failed to get user from DB with id: ${sub}`);
    return next(
      new AppError(
        `Failed to get the user with id: ${sub} and email: ${email}`,
        404
      )
    );
  }

  const postFound = await PostModel.find({ userId: sub })
    .populate("eventId", "name type startTime endTime")
    .sort({ createdAt: -1 }); // Optional: latest first

  return res.status(200).json({
    statusCode: 200,
    message: "User's Posts Fetched Successfully",
    postFound,
    success: true,
    count: postFound.length,
  });
});

export const ToggleLike = CustomTryCatch(async (req, res, next) => {
  const postId = req.params.postId;
  const { sub: userId } = req.user;

  const post = await PostModel.findById(postId);
  if (!post) {
    logger.error(`Post with ID ${postId} not found.`);
    return next(new AppError(`Post not found`, 404));
  }

  const hasLiked = post.likes.includes(userId);
  const hasDisliked = post.dislikes.includes(userId);

  // Remove like if already liked
  if (hasLiked) {
    post.likes.pull(userId);
    post.likesCount -= 1;
  } else {
    post.likes.push(userId);
    post.likesCount += 1;

    // Remove dislike if exists
    if (hasDisliked) {
      post.dislikes.pull(userId);
      post.dislikesCount -= 1;
    }
  }

  await post.save();

  return res.status(200).json({
    statusCode: 200,
    success: true,
    message: hasLiked ? "Like removed" : "Post liked",
    likesCount: post.likesCount,
    dislikesCount: post.dislikesCount,
  });
});

export const ToggleDislike = CustomTryCatch(async (req, res, next) => {
  const postId = req.params.postId;
  const { sub: userId } = req.user;

  const post = await PostModel.findById(postId);
  if (!post) {
    logger.error(`Post with ID ${postId} not found.`);
    return next(new AppError(`Post not found`, 404));
  }

  const hasDisliked = post.dislikes.includes(userId);
  const hasLiked = post.likes.includes(userId);

  // Remove dislike if already disliked
  if (hasDisliked) {
    post.dislikes.pull(userId);
    post.dislikesCount -= 1;
  } else {
    post.dislikes.push(userId);
    post.dislikesCount += 1;

    // Remove like if exists
    if (hasLiked) {
      post.likes.pull(userId);
      post.likesCount -= 1;
    }
  }

  await post.save();

  return res.status(200).json({
    statusCode: 200,
    success: true,
    message: hasDisliked ? "Dislike removed" : "Post disliked",
    likesCount: post.likesCount,
    dislikesCount: post.dislikesCount,
  });
});
