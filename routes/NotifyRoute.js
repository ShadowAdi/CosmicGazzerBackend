import express from "express";
import { CheckAuth } from "../middlewares/AuthCheck.js";
import {
  GetAllNotification,
  GetAllNotificationBasedOnUser,
} from "../controllers/notify-controller.js";

export const NotifyRouter = express.Router();

NotifyRouter.get("/", CheckAuth, GetAllNotification);
NotifyRouter.get("/:eventId", CheckAuth, GetAllNotificationBasedOnUser);
