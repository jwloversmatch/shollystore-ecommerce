import webpush from "web-push";
import { PushSubscriptionModel } from "../models/PushSubscription";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_CONTACT_EMAIL =
  process.env.VAPID_CONTACT_EMAIL || "support@sholexstore.com";

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  throw new Error(
    "VAPID keys are missing. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in your environment.",
  );
}

webpush.setVapidDetails(
  `mailto:${VAPID_CONTACT_EMAIL}`,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
);

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  image?: string;
  data?: {
    url?: string;
  };
}

export const sendPushNotification = async (
  subscription: webpush.PushSubscription,
  payload: NotificationPayload,
): Promise<{ success: boolean; expired?: boolean }> => {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return { success: true };
  } catch (error: any) {
    if (error.statusCode === 410 || error.statusCode === 404) {
      await PushSubscriptionModel.deleteOne({
        endpoint: subscription.endpoint,
      });
      return { success: false, expired: true };
    }
    console.error("Push notification error:", error);
    return { success: false };
  }
};

export interface PushResult {
  sent: number;
  failed: number;
  expired: number;
}

/**
 * Send a push to every device a specific user has subscribed.
 * Matches subscriptions by `userId` (the field on PushSubscriptionModel).
 */
export const sendPushToUser = async (
  userId: string,
  payload: NotificationPayload,
): Promise<PushResult> => {
  const subscriptions = await PushSubscriptionModel.find({ userId });

  const result: PushResult = { sent: 0, failed: 0, expired: 0 };
  if (subscriptions.length === 0) return result;

  for (const sub of subscriptions) {
    const r = await sendPushNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
      },
      payload,
    );

    if (r.success) result.sent++;
    else if (r.expired) result.expired++;
    else result.failed++;
  }

  return result;
};

export const broadcastPushNotification = async (
  payload: NotificationPayload,
): Promise<PushResult> => {
  const subscriptions = await PushSubscriptionModel.find({});

  const result: PushResult = { sent: 0, failed: 0, expired: 0 };

  const CONCURRENCY = 20;
  for (let i = 0; i < subscriptions.length; i += CONCURRENCY) {
    const batch = subscriptions.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map((sub) =>
        sendPushNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
          },
          payload,
        ),
      ),
    );
    for (const r of batchResults) {
      if (r.success) result.sent++;
      else if (r.expired) result.expired++;
      else result.failed++;
    }
  }

  return result;
};