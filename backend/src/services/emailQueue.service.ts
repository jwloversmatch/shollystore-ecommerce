import { EmailQueue } from "../models/EmailQueue";

interface QueueEmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const enqueueEmail = async (payload: QueueEmailPayload): Promise<void> => {
  try {
    await EmailQueue.create({
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      status: "pending",
      attempts: 0,
      maxAttempts: 3,
    });
  } catch (error) {
    console.error("Failed to enqueue email:", error);
  }
};