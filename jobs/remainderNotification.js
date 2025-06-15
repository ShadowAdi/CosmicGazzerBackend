import cron from "node-cron";
import { ReminderModel } from "../models/ReminderSchema";
import { logger } from "../utils/logger";

cron.schedule("*/1 * * * *", async () => {
  const now = new Date();
  try {
    const remainderToNotify = await ReminderModel.find({
      notifyAt: { $lte: now },
      notified: false,
    })
      .populate("userId", "email name")
      .populate("eventId", "name startTime");
    for (const remainder of remainderToNotify) {
      const { userId, eventId } = remainder;
      logger.info(
        `🔔 Sending notification to ${userId.email} for event ${eventId.name} at ${eventId.startTime}`
      );
      remainder.notified = true;
      await remainder.save();
    }
    if (remainderToNotify.length) {
      logger.info(`✅ Sent ${remainderToNotify.length} reminders.`);
    }
  } catch (error) {
    logger.error("Error running reminder notification job:", err);
  }
});
