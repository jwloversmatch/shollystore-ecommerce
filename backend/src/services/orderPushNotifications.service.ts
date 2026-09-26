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
 * Fire-and-forget push notification for order status changes.
 * Matches subscriptions by the order's user._id (guests have no subscription).
 * Never throws.
 */
export const notifyOrderStatusViaPush = async (
  order: IOrder,
  newStatus: string,
): Promise<void> => {
  try {
    if (!order.user) return;

    const payload = buildPayload(order, newStatus);
    if (!payload) return;

    const userId =
      typeof order.user === "string"
        ? order.user
        : order.user.toString();

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