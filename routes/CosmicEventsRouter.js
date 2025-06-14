import express from "express";
import { CheckAuth } from "../middlewares/AuthCheck.js";
import {
  AuthenticatedUserEvents,
  CreateEvent,
  DeleteEvent,
  GetAllEvents,
  GetEvent,
  GetEventsByUser,
  UpdateEvent,
} from "../controllers/event-controller.js";

export const CosmicEventsRouter = express.Router();

CosmicEventsRouter.get("/filter", GetAllEvents);
CosmicEventsRouter.get("/user/:userId", GetEventsByUser);
CosmicEventsRouter.get("/:eventId", GetEvent);

CosmicEventsRouter.use(CheckAuth);

CosmicEventsRouter.post("/create", CreateEvent);
CosmicEventsRouter.get("/my/events", AuthenticatedUserEvents);
CosmicEventsRouter.patch("/update/:eventId", UpdateEvent);
CosmicEventsRouter.delete("/delete/:eventId", DeleteEvent);
