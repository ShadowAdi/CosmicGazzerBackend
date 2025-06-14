import express from "express";
import { AuthenticatedUser, LoginUser } from "../controllers/auth-controller.js";
import { CheckAuth } from "../middlewares/AuthCheck.js";

export const AuthRouter = express.Router();

AuthRouter.post("/login", LoginUser);
AuthRouter.get("/me", CheckAuth, AuthenticatedUser);
