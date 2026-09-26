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

interface NotificationPayload {
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
      // Subscription is dead — clean it up
      await PushSubscriptionModel.deleteOne({
        endpoint: subscription.endpoint,
      });
      return { success: false, expired: true };
    }

    console.error("Push notification error:", error);
    return { success: false };
  }
};

export const broadcastPushNotification = async (
  payload: NotificationPayload,
): Promise<{ sent: number; failed: number; expired: number }> => {
  const subscriptions = await PushSubscriptionModel.find({});

  let sent = 0;
  let failed = 0;
  let expired = 0;

  // Fire in parallel batches so a slow push service doesn't block the rest.
  // Sequential loop would take N × ~300ms for N subscribers.
  const CONCURRENCY = 20;
  for (let i = 0; i < subscriptions.length; i += CONCURRENCY) {
    const batch = subscriptions.slice(i, i + CONCURRENCY);

    const results = await Promise.all(
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

    for (const r of results) {
      if (r.success) sent++;
      else if (r.expired) expired++;
      else failed++;
    }
  }

  return { sent, failed, expired };
};