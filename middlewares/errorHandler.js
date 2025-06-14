import { logger } from "../utils/logger.js";

export const CustomErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; // default
  err.status = err.status || "error";
  logger.error(
    `Failed to get the error the status code is ${err.status} and the message is ${err.message}`
  );
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
