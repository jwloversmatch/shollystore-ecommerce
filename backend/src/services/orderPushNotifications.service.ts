import type { IOrder } from "../models/Order";
import {
  sendPushToUser,
  type NotificationPayload,
} from "./pushNotification.service";

const CLIENT_URL =
  process.env.CLIENT_URL || "https://www.sholexstore.com";

const buildPayload = (
  order: IOrder,
  status: string,
): NotificationPayload | null => {
  const orderRef = order.orderRef || order._id.toString();
  const trackUrl = `${CLIENT_URL}/track-order?orderId=${encodeURIComponent(orderRef)}`;

  switch (status) {
    case "Paid":
      return {
        title: "Payment received ✅",
        body: `Order ${orderRef} is confirmed. We're preparing it now.`,
        icon: "/icons/sholex-192.png",
        data: { url: trackUrl },
      };
    case "Shipped":
      return {
        title: "Your order has shipped! 🚚",
        body: `Order ${orderRef} is on its way. Tap to track it.`,
        icon: "/icons/sholex-192.png",
        data: { url: trackUrl },
      };
    case "Delivered":
      return {
        title: "Delivered! ✅",
        body: `Order ${orderRef} has been delivered. Enjoy your purchase!`,
        icon: "/icons/sholex-192.png",
        data: { url: trackUrl },
      };
    case "Cancelled":
      return {
        title: "Order cancelled",
        body: `Order ${orderRef} was cancelled. Open the app for details.`,
        icon: "/icons/sholex-192.png",
        data: { url: trackUrl },
      };
    default:
      return null;
  }
};

/**
 * Safely extract a user ID from order.user.
 *
 * order.user can be one of three things:
 *  1. null / undefined     → guest order, no notification target
 *  2. ObjectId             → registered user, no populate
 *  3. Populated user doc   → { _id, email, name, phone } (object)
 *
 * Returns a plain string suitable for a Mongoose `{ userId }` query.
 */
const extractUserId = (user: unknown): string | null => {
  if (!user) return null;

  // Case 1: raw ObjectId or string
  if (typeof user === "string") return user;

  // Case 2: populated object → use its _id
  if (typeof user === "object" && user !== null) {
    const maybeId = (user as { _id?: unknown })._id;
    if (maybeId) return String(maybeId);
  }

  // Case 3: ObjectId instance — String() gives the hex id
  try {
    return String(user);
  } catch {
    return null;
  }
};

/**
 * Fire-and-forget push notification for order status changes.
 * Never throws. Silently no-ops for guests and non-subscribers.
 */
export const notifyOrderStatusViaPush = async (
  order: IOrder,
  newStatus: string,
): Promise<void> => {
  try {
    const userId = extractUserId(order.user);
    if (!userId) return;

    const payload = buildPayload(order, newStatus);
    if (!payload) return;

    const result = await sendPushToUser(userId, payload);

    if (result.sent > 0 || result.expired > 0) {
      console.log(
        `[push] Order ${order.orderRef || order._id} → ${newStatus}: ` +
          `sent=${result.sent} expired=${result.expired} failed=${result.failed}`,
      );
    }
  } catch (err) {
    console.error("[push] Failed to notify order status:", err);
  }
};