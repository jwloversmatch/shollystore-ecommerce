import { Request, Response } from "express";
import mongoose from "mongoose";
import { Order, IOrder } from "../models/Order";
import { Product } from "../models/Product";
import { User } from "../models/User";
import { Coupon } from "../models/Coupon";
import { paystack, PaystackError, ValidationError } from "../config/paystack";
import {
  sendOrderConfirmation,
  sendAdminOrderNotification,
} from "../services/email.service";
import { AuthRequest } from "../middleware/auth";
import { calculateOrderPricing } from "../utils/orderPricing";
import { sendError } from "../utils/apiResponse";
import { calculateShippingFee } from "../utils/shipping";

// ─── Helper: generate a user-friendly tracking number ─────────────────────────
const generateTrackingNumber = (): string => {
  const year = new Date().getFullYear();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SHO-${year}-${result}`;
};

// @desc    Create Order (supports multiple payment methods)
// @route   POST /api/orders
export const createOrder = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod = "paystack",
      couponCode,
      notes,
      isGift,
      giftMessage,
      shippingInfo,
      guestEmail,
    } = req.body;

    const isGuest = !req.user;
    const customerEmail = isGuest ? guestEmail : req.user!.email;
    if (!customerEmail) {
      res.status(400).json({ success: false, message: "Email is required" });
      return;
    }

    // Calculate shipping fee based on destination (robust)
    const shippingFee = calculateShippingFee(shippingAddress);

    let pricing;
    try {
      pricing = await calculateOrderPricing(
        orderItems,
        couponCode,
        shippingFee,
      );
    } catch (pricingError) {
      const msg =
        pricingError instanceof Error ? pricingError.message : "Invalid order";
      res.status(400).json({ success: false, message: msg });
      return;
    }

    const { subtotal, discount, taxAmount, totalPrice } = pricing;

    // Generate unique tracking number
    let trackingNumber = generateTrackingNumber();
    let existingOrder = await Order.findOne({ trackingNumber });
    while (existingOrder) {
      trackingNumber = generateTrackingNumber();
      existingOrder = await Order.findOne({ trackingNumber });
    }

    // Ensure orderItems have required fields (fallback for safety)
    const sanitizedOrderItems = pricing.orderItems.map((item: any) => ({
      name: item.name || "Unknown Product",
      qty: item.qty || 1,
      price: item.price || 0,
      product: item.product,
      image: item.image || "",
      variant: item.variant,
    }));

    // Ensure shippingAddress has required fields (fallback for safety)
    const sanitizedShippingAddress = {
      address: shippingAddress?.address || "No address provided",
      city: shippingAddress?.city || "No city provided",
      postalCode: shippingAddress?.postalCode || "",
      country: shippingAddress?.country || "Nigeria",
      phone: shippingAddress?.phone || "",
      email: shippingAddress?.email || "",
    };

    const orderData = {
      user: req.user?._id || null,
      guestEmail: isGuest ? guestEmail : undefined,
      name: req.user?.name || req.body.name || "",
      phone: req.user?.phone || req.body.phone || "",
      email: customerEmail,
      trackingNumber,
      orderItems: sanitizedOrderItems,
      shippingAddress: sanitizedShippingAddress,
      totalPrice,
      subtotal,
      taxAmount,
      shippingFee,
      status: "Pending" as const,
      paymentMethod,
      paymentDetails:
        paymentMethod === "bank_transfer"
          ? {
              bankName: process.env.BANK_NAME || "",
              accountName: process.env.BANK_ACCOUNT_NAME || "",
              accountNumber: process.env.BANK_ACCOUNT_NUMBER || "",
            }
          : paymentMethod === "whatsapp"
            ? {
                whatsappNumber: process.env.WHATSAPP_NUMBER || "",
              }
            : undefined,
      couponCode: pricing.couponCode || undefined,
      discount,
      notes: notes || undefined,
      isGift: isGift || false,
      giftMessage: giftMessage || undefined,
      shippingInfo: shippingInfo || {},
    };

    // 🔍 Temporary log to inspect actual orderData
    console.log("orderData to save:", JSON.stringify(orderData, null, 2));

    const createdOrder = (await Order.create(orderData)) as IOrder;

    if (paymentMethod === "paystack") {
      try {
        const amountInKobo = Math.round(totalPrice * 100);
        const orderIdString = createdOrder._id.toString();

        const paymentData = await paystack.initializePayment(
          customerEmail,
          amountInKobo,
          orderIdString,
        );

        if (!paymentData.status) {
          await Order.findByIdAndDelete(createdOrder._id);
          res.status(400).json({ success: false, message: "Paystack error" });
          return;
        }

        sendAdminOrderNotification(createdOrder, "created").catch((err) =>
          console.error("Failed to send admin order notification:", err),
        );

        res.status(201).json({
          success: true,
          order: {
            ...createdOrder.toObject(),
            trackingNumber: createdOrder.trackingNumber,
          },
          paymentUrl: paymentData.data.authorization_url,
          reference: paymentData.data.reference,
        });
      } catch (paystackError) {
        await Order.findByIdAndDelete(createdOrder._id);
        throw paystackError;
      }
    } else {
      sendOrderConfirmation(
        customerEmail,
        createdOrder.trackingNumber || createdOrder._id.toString(),
        totalPrice,
        req.user?.name || req.body.name || "",
        discount,
        pricing.couponCode,
        subtotal,
        paymentMethod,
        createdOrder.paymentDetails,
        shippingFee,
      ).catch((emailError) => {
        console.error(
          "Failed to send customer order confirmation email:",
          emailError,
        );
      });

      sendAdminOrderNotification(createdOrder, "created").catch((err) =>
        console.error("Failed to send admin order notification:", err),
      );

      res.status(201).json({
        success: true,
        order: {
          ...createdOrder.toObject(),
          trackingNumber: createdOrder.trackingNumber,
        },
        paymentMethod,
      });
    }
  } catch (error: any) {
    if (error instanceof ValidationError) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    if (error instanceof PaystackError) {
      res.status(502).json({
        success: false,
        message: "Payment processing failed. Please try again.",
      });
      return;
    }
    sendError(res, 500, "Internal server error");
  }
};

// @desc    Paystack Webhook (Server-to-Server verification)
// @route   POST /api/orders/webhook
export const paystackWebhook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const signature = req.headers["x-paystack-signature"] as string;
    const rawBody = req.body;

    if (!signature || !rawBody) {
      res.status(401).send("Unauthorized");
      return;
    }

    // Verify signature
    const isValid = paystack.verifyWebhookSignature(
      rawBody.toString(),
      signature,
    );
    if (!isValid) {
      res.status(401).send("Unauthorized");
      return;
    }

    let event;
    try {
      event = JSON.parse(rawBody.toString());
    } catch (parseError) {
      console.error("Invalid JSON in webhook payload:", parseError);
      res.status(400).send("Invalid JSON");
      return;
    }

    // ── Idempotency check ─────────────────────────────────────────────────
    const eventId = event.data?.id;
    if (!eventId) {
      res.status(400).send("Event ID missing");
      return;
    }

    // If this event has already been processed, return success
    const alreadyProcessed = await Order.findOne({ paymentEventId: eventId });
    if (alreadyProcessed) {
      res.status(200).send("Webhook already processed");
      return;
    }

    const orderId = event.data?.metadata?.order_id;
    if (!orderId) {
      res.status(400).send("Order ID missing");
      return;
    }

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).send("Order not found");
      return;
    }

    // ── Handle charge.success ────────────────────────────────────────────
    if (event.event === "charge.success") {
      // Ensure stock is deducted only once
      if (order.status === "Pending") {
        for (const item of order.orderItems) {
          const product = await Product.findById(item.product);
          if (!product) continue;

          if (
            item.variant &&
            (item.variant.sku || item.variant.color || item.variant.size)
          ) {
            const variant = product.variants?.find(
              (v) =>
                v.sku === item.variant?.sku ||
                (v.color === item.variant?.color &&
                  v.size === item.variant?.size),
            );
            if (variant) {
              if (variant.stock !== undefined) {
                variant.stock = Math.max(0, variant.stock - item.qty);
              }
              product.stock = Math.max(0, product.stock - item.qty);
              await product.save();
            }
          } else {
            product.stock = Math.max(0, product.stock - item.qty);
            await product.save();
          }
        }
      }

      order.status = "Paid";
      order.paymentResult = {
        id: event.data.id,
        status: event.data.status,
        update_time: event.data.paid_at,
      };
      order.paymentEventId = eventId;
      order.paymentEventType = event.event;

      await order.save();

      if (order.couponCode) {
        await Coupon.updateOne(
          { code: (order.couponCode as string).toUpperCase() },
          { $inc: { usedCount: 1 } },
        );
      }

      sendAdminOrderNotification(order, "updated", "Paid").catch((err) =>
        console.error("Failed to send admin order notification:", err),
      );

      const customerEmail = order.email || order.guestEmail || "";
      const customerName = order.name || "";
      const originalSubtotal = order.orderItems.reduce(
        (sum: number, item) => sum + item.price * item.qty,
        0,
      );

      if (customerEmail) {
        sendOrderConfirmation(
          customerEmail,
          order.trackingNumber || order._id.toString(),
          order.totalPrice,
          customerName,
          order.discount || 0,
          order.couponCode as string,
          originalSubtotal,
          order.paymentMethod,
          order.paymentDetails,
          order.shippingFee || 0,
        ).catch((emailError) => {
          console.error("Failed to send order confirmation email:", emailError);
        });
      } else {
        console.warn("No email found for order", order._id);
      }

      res.status(200).send("Webhook received");
      return;
    }

    // ── Handle charge.failed ─────────────────────────────────────────────
    if (event.event === "charge.failed") {
      order.paymentEventId = eventId;
      order.paymentEventType = event.event;
      order.paymentFailReason = event.data.gateway_response || "Payment failed";
      await order.save();

      sendAdminOrderNotification(order, "updated", "Failed").catch((err) =>
        console.error("Failed to send admin order notification:", err),
      );

      res.status(200).send("Webhook received");
      return;
    }

    // Unknown event: just record it
    order.paymentEventId = eventId;
    order.paymentEventType = event.event;
    await order.save();
    res.status(200).send("Webhook received");
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).send("Webhook processing failed");
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const reference = req.params.reference as string;
    const result = await paystack.verifyPayment(reference);
    res.json(result);
  } catch (error) {
    if (error instanceof PaystackError) {
      return res
        .status(502)
        .json({ success: false, message: "Payment verification failed." });
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getMyOrders = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const orders = await Order.find({ user: req.user!._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error: any) {
    sendError(res, 500, "Internal server error");
  }
};

// @desc    Track guest/order by ID or tracking number + email
// @route   GET /api/orders/track/:orderId?email=...
export const trackOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const orderId = String(req.params.orderId);
    const email = String(req.query.email || "").toLowerCase();

    if (!orderId || !email) {
      res
        .status(400)
        .json({ success: false, message: "Order ID and email are required" });
      return;
    }

    const isValidObjectId = mongoose.Types.ObjectId.isValid(orderId);

    const identifierCondition = isValidObjectId
      ? {
          $or: [
            { _id: new mongoose.Types.ObjectId(orderId) },
            { trackingNumber: orderId },
          ],
        }
      : { trackingNumber: orderId };

    const emailCondition = {
      $or: [
        { email: email.toLowerCase() },
        { guestEmail: email.toLowerCase() },
      ],
    };

    const order = await Order.findOne({
      $and: [identifierCondition, emailCondition],
    }).select("-__v");

    if (!order) {
      res
        .status(404)
        .json({ success: false, message: "Order not found or email mismatch" });
      return;
    }

    const paymentDetails =
      order.status === "Pending" &&
      (order.paymentMethod === "bank_transfer" ||
        order.paymentMethod === "whatsapp")
        ? order.paymentDetails
        : undefined;

    res.json({
      success: true,
      order: {
        _id: order._id,
        trackingNumber: order.trackingNumber,
        status: order.status,
        totalPrice: order.totalPrice,
        orderItems: order.orderItems,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        paymentDetails,
        shippingFee: order.shippingFee,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};