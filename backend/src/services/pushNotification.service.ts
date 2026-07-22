import webpush from 'web-push';
import { PushSubscriptionModel } from '../models/PushSubscription';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;

webpush.setVapidDetails(
  'mailto:store@shollystore.com',   // your contact email
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  image?: string;
  data?: {
    url?: string;   // destination when user clicks the notification
  };
}

export const sendPushNotification = async (
  subscription: any,   // web-push subscription object
  payload: NotificationPayload
) => {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (error: any) {
    if (error.statusCode === 410 || error.statusCode === 404) {
      // Subscription expired or invalid – delete it
      await PushSubscriptionModel.deleteOne({ endpoint: subscription.endpoint });
    } else {
      console.error('Push notification error:', error);
    }
  }
};

export const broadcastPushNotification = async (payload: NotificationPayload) => {
  const subscriptions = await PushSubscriptionModel.find({});
  for (const sub of subscriptions) {
    await sendPushNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
      },
      payload
    );
  }
};