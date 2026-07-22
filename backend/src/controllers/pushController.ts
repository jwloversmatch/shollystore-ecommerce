import { Request, Response } from 'express';
import { PushSubscriptionModel } from '../models/PushSubscription';
import { broadcastPushNotification } from '../services/pushNotification.service';

// POST /api/push/subscribe
export const subscribe = async (req: Request, res: Response) => {
  try {
    const { endpoint, keys } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      res.status(400).json({ message: 'Invalid subscription data' });
      return;
    }

    await PushSubscriptionModel.findOneAndUpdate(
      { endpoint },
      { endpoint, keys },
      { upsert: true, new: true }
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
    await PushSubscriptionModel.deleteOne({ endpoint });
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
      // icon and image you can set as static assets
      icon: '/icons/icon-192x192.png',
      image: '/og-default.jpg',
    });
    res.json({ success: true, message: 'Notification sent' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};