import { Request, Response } from "express";
import { PushSubscriptionModel } from "../models/PushSubscription";
import { broadcastPushNotification } from "../services/pushNotification.service";
import type { AuthRequest } from "../middleware/auth";

// POST /api/push/subscribe
export const subscribe = async (req: AuthRequest, res: Response) => {
  try {
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      res.status(400).json({ message: "Invalid subscription data" });
      return;
    }

    const userId = req.user?._id;

    await PushSubscriptionModel.findOneAndUpdate(
      { endpoint },
      {
        endpoint,
        keys: { p256dh: keys.p256dh, auth: keys.auth },
        ...(userId ? { userId } : {}),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/push/unsubscribe
export const unsubscribe = async (req: Request, res: Response) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) {
      res.status(400).json({ message: "Endpoint is required" });
      return;
    }
    await PushSubscriptionModel.deleteOne({ endpoint });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/push/send (admin only)
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