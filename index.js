import express from "express";
import dotenv from "dotenv";
import { UserRouter } from "./routes/userRouter.js";
import { PostRouter } from "./routes/postRouter.js";
import { CosmicEventsRouter } from "./routes/CosmicEventsRouter.js";
import { logger } from "./utils/logger.js";
import cors from "cors";
import { CustomErrorHandler } from "./middlewares/errorHandler.js";
import { AuthRouter } from "./routes/AuthRoutes.js";
import { DBConnect } from "./config/dbConnect.js";
dotenv.configDotenv();

const app = express();
app.use(
  cors({
    allowedHeaders: true,
    methods: ["*"],
    origin: ["*"],
  })
);
app.use(express.json());

app.use("/api/users", UserRouter);
app.use("/api/posts", PostRouter);
app.use("/api/cosmic-events", CosmicEventsRouter);
app.use("/api/auth", AuthRouter);

app.use(CustomErrorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  DBConnect();
  logger.info("Server Started at the port of " + PORT);
  console.log("Server Started");
});
