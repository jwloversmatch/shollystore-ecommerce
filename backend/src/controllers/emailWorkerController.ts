import { Request, Response } from "express";
import { EmailQueue } from "../models/EmailQueue";
import { sendEmailViaBrevo } from "../services/brevoSender";

const BATCH_SIZE = 20;

export const processEmailQueue = async (req: Request, res: Response) => {
  // Optional secret check
  const secret = req.query.secret;
  if (secret !== process.env.EMAIL_WORKER_SECRET) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const pendingEmails = await EmailQueue.find({
    status: "pending",
    attempts: { $lt: 3 },
  })
    .sort({ createdAt: 1 })
    .limit(BATCH_SIZE);

  let sentCount = 0;
  let failedCount = 0;

  for (const email of pendingEmails) {
    try {
      await sendEmailViaBrevo(email.to, email.subject, email.html, email.text);
      email.status = "sent";
      email.lastError = undefined;
      await email.save();
      sentCount++;
    } catch (error) {
      email.attempts += 1;
      email.lastError = error instanceof Error ? error.message : "Unknown error";
      if (email.attempts >= email.maxAttempts) {
        email.status = "failed";
      }
      await email.save();
      failedCount++;
    }
  }

  res.json({
    success: true,
    processed: pendingEmails.length,
    sent: sentCount,
    failed: failedCount,
  });
};