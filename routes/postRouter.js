import express from "express";
import {
  AuthenticatedUserPosts,
  CreatePost,
  DeletedPost,
  GetAllPosts,
  GetPost,
  GetPostBasedOnEvent,
  GetPostBasedOnUser,
  ToggleDislike,
  ToggleLike,
  UpdatePost,
} from "../controllers/post-controller.js";
import { CheckAuth } from "../middlewares/AuthCheck.js";

export const PostRouter = express.Router();

PostRouter.get("/", GetAllPosts);
PostRouter.post("/:eventId", CreatePost);
PostRouter.get("/:eventId", GetPostBasedOnEvent);
PostRouter.get("/user/:userId", GetPostBasedOnUser);
PostRouter.get("/me", AuthenticatedUserPosts);
PostRouter.get("/post/:postId", GetPost);
PostRouter.patch("/post/:postId", CheckAuth, UpdatePost);
PostRouter.delete("/post/:postId", CheckAuth, DeletedPost);
PostRouter.delete("/post/like/:postId", CheckAuth, ToggleLike);
PostRouter.delete("/post/dislike/:postId", CheckAuth, ToggleDislike);
