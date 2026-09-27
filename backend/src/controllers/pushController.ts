import { Request, Response } from "express";
import { PushSubscriptionModel } from "../models/PushSubscription";
import { broadcastPushNotification } from "../services/pushNotification.service";
import type { AuthRequest } from "../middleware/auth";

// POST /api/push/subscribe
// Requires auth (protect middleware on the route).
// The userId from req.user is what makes per-user pushes possible.
export const subscribe = async (req: AuthRequest, res: Response) => {
  try {
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      res.status(400).json({ message: "Invalid subscription data" });
      return;
    }

    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    // Upsert by endpoint. Refresh userId in case the same browser
    // signs in as a different account later.
    await PushSubscriptionModel.findOneAndUpdate(
      { endpoint },
      {
        endpoint,
        keys: { p256dh: keys.p256dh, auth: keys.auth },
        userId,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/push/unsubscribe
// Requires auth — scoped to the requesting user's own subscriptions.
export const unsubscribe = async (req: AuthRequest, res: Response) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      res.status(400).json({ message: "Endpoint is required" });
      return;
    }

    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    // Scoped delete — prevents one user from removing another user's device.
    await PushSubscriptionModel.deleteOne({ endpoint, userId });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/push/send (admin only – or integrate with your existing marketing)
export const sendNotification = async (req: Request, res: Response) => {
  try {
    const { title, body, url } = req.body;
    await broadcastPushNotification({
      title,
      body,
      data: { url },
      icon: "/icons/icon-192x192.png",
      image: "/og-default.jpg",
    });
    res.json({ success: true, message: "Notification sent" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};