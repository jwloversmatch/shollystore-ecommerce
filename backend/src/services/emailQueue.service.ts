import { EmailQueue } from "../models/EmailQueue";
import { sendEmailViaBrevo } from "./brevoSender";

interface QueueEmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Process a single queue record inline — no HTTP, no waiting for the cron.
 * Used as a fast path so transactional emails (password reset, verification,
 * order confirmation) arrive within seconds instead of minutes.
 *
 * On failure: leaves the record as "pending" with an incremented attempt
 * counter, so the cron endpoint can retry it on its next run.
 */
const processOneImmediately = async (id: string): Promise<void> => {
  try {
    const email = await EmailQueue.findById(id);
    if (!email || email.status !== "pending") return;

    await sendEmailViaBrevo(email.to, email.subject, email.html, email.text);

    email.status = "sent";
    email.lastError = undefined;
    await email.save();
  } catch (error) {
    // Don't throw — this runs in the background. The cron retries it.
    try {
      const email = await EmailQueue.findById(id);
      if (email) {
        email.attempts += 1;
        email.lastError =
          error instanceof Error ? error.message : "Unknown error";
        if (email.attempts >= email.maxAttempts) {
          email.status = "failed";
        }
        await email.save();
      }
    } catch (innerErr) {
      console.error(
        "[emailQueue] Failed to record delivery failure:",
        innerErr,
      );
    }
    console.error("[emailQueue] Inline send failed:", error);
  }
};

/**
 * Enqueue an email and attempt to deliver it immediately.
 *
 * Flow:
 *  1. Persist the record with status "pending".
 *  2. Fire off an inline send in the background.
 *  3. Return without waiting — callers stay fast.
 *
 * If the inline send fails or is interrupted (e.g. server spin-down),
 * the record stays as "pending" and the cron endpoint retries it.
 */
export const enqueueEmail = async (
  payload: QueueEmailPayload,
): Promise<void> => {
  try {
    const record = await EmailQueue.create({
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      status: "pending",
      attempts: 0,
      maxAttempts: 3,
    });

    void processOneImmediately(record._id.toString());
  } catch (error) {
    console.error("Failed to enqueue email:", error);
  }
};