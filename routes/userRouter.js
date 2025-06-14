import express from "express";
import {
    CreateUser,
    DeleteUser,
  GetAllUsers,
  GetUser,
  UpdateUser,
} from "../controllers/user-controller.js";
import { CheckAuth } from "../middlewares/AuthCheck.js";

export const UserRouter = express.Router();

UserRouter.get("/", GetAllUsers);
UserRouter.get("/user/:userId", GetUser);
UserRouter.patch("/user/", CheckAuth, UpdateUser);
UserRouter.delete("/user/", CheckAuth, DeleteUser);
UserRouter.post("/",  CreateUser);


