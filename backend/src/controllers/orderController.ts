import { Request, Response } from "express";
import mongoose from "mongoose";
import crypto from "crypto";
import { Order, IOrder } from "../models/Order";
import { Product } from "../models/Product";
import { User } from "../models/User";
import { Coupon } from "../models/Coupon";
import { Settings } from "../models/Settings";
import { paystack, PaystackError, ValidationError } from "../config/paystack";
import {
  sendOrderConfirmation,
  sendAdminOrderNotification,
  sendOrderStatusUpdateEmail,
} from "../services/email.service";
import { AuthRequest } from "../middleware/auth";
import { calculateOrderPricing } from "../utils/orderPricing";
import { sendError } from "../utils/apiResponse";
import { calculateShippingFee } from "../utils/shipping";

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Generate a stable, human-readable order reference: SHX-2026-K7M3Q9
 *
 * Random 6-character suffix (not sequential) so order volume can't be
 * inferred by placing two orders and comparing. Uses a charset that omits
 * 0/O, 1/I/L so customers can read the ref over the phone or write it
 * on a bank transfer slip without ambiguity.
 */
const generateOrderRef = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const LENGTH = 6;

  for (let attempt = 0; attempt < 5; attempt++) {
    let suffix = "";
    for (let i = 0; i < LENGTH; i++) {
      suffix += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    }

    const ref = `SHX-${year}-${suffix}`;
    const exists = await Order.exists({ orderRef: ref });
    if (!exists) return ref;
  }

  return `SHX-${year}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
};

/** Build a prefilled WhatsApp deep link for sending a bank transfer receipt */
const buildWhatsAppReceiptUrl = (
  orderRef: string,
  whatsappNumber?: string | null,
): string | undefined => {
  if (!whatsappNumber) return undefined;
  const digits = whatsappNumber.replace(/\D/g, "");
  if (!digits) return undefined;

  const message = encodeURIComponent(
    `Hi, I just placed order ${orderRef}. Here's my transfer receipt:`,
  );
  return `https://wa.me/${digits}?text=${message}`;
};

const generateTrackingNumber = (): string => {
  const year = new Date().getFullYear();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SHO-${year}-${result}`;
};

const generateTrackingToken = (): { raw: string; hashed: string } => {
  const raw = crypto.randomBytes(32).toString("hex");
  const hashed = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, hashed };
};

// ─── Atomic stock decrement (shared logic) ────────────────────────────────
/**
 * Decrement stock for a single order item atomically.
 *
 * Uses $inc rather than read-modify-write to prevent the race condition
 * where two parallel orders both read stock=1 and both save stock=0.
 * After the decrement, negative values are clamped back to 0 as a
 * safety net against oversell.
 *
 * Returns true if any stock was changed (used to decide whether to
 * run low-stock notification checks).
 */
const decrementStockForItem = async (
  productId: mongoose.Types.ObjectId,
  qty: number,
  variantInput?: { sku?: string; color?: string; size?: string },
): Promise<boolean> => {
  const product = await Product.findById(productId);
  if (!product) return false;

  const hasVariant =
    variantInput &&
    (variantInput.sku || variantInput.color || variantInput.size);

  if (hasVariant) {
    const variant = product.variants?.find(
      (v) =>
        (variantInput.sku && v.sku === variantInput.sku) ||
        (variantInput.color &&
          variantInput.size &&
          v.color === variantInput.color &&
          v.size === variantInput.size),
    );
    if (!variant) return false;

    // Atomic decrement for variant stock AND parent product stock.
    if (variant._id) {
      await Product.updateOne(
        { _id: product._id },
        {
          $inc: {
            "variants.$[v].stock": -qty,
            stock: -qty,
          },
        },
        { arrayFilters: [{ "v._id": variant._id }] },
      );
    } else {
      // Fallback for variants without _id — match by identifying fields
      const match: Record<string, unknown> = {};
      if (variant.sku) match["variants.sku"] = variant.sku;
      if (variant.color) match["variants.color"] = variant.color;
      if (variant.size) match["variants.size"] = variant.size;

      await Product.updateOne(
        { _id: product._id, ...match },
        {
          $inc: {
            "variants.$.stock": -qty,
            stock: -qty,
          },
        },
      );
    }

    // Clamp any negative values back to 0.
    await Product.updateOne(
      { _id: product._id, stock: { $lt: 0 } },
      { $set: { stock: 0 } },
    );
    await Product.updateOne(
      { _id: product._id, "variants.stock": { $lt: 0 } },
      { $set: { "variants.$[v].stock": 0 } },
      { arrayFilters: [{ "v.stock": { $lt: 0 } }] },
    );
  } else {
    // Base product stock only.
    await Product.updateOne(
      { _id: product._id },
      { $inc: { stock: -qty } },
    );
    await Product.updateOne(
      { _id: product._id, stock: { $lt: 0 } },
      { $set: { stock: 0 } },
    );
  }

  // Re-fetch and fire low-stock notification if applicable
  const updated = await Product.findById(product._id);
  if (updated) {
    await updated.checkLowStockAndNotify();
  }

  return true;
};

const sanitizeOrderForTracking = (order: IOrder, includeEmail = false) => {
  return {
    _id: order._id,
    orderRef: order.orderRef,
    trackingNumber: order.trackingNumber,
    status: order.status,
    totalPrice: order.totalPrice,
    orderItems: order.orderItems.map((item) => ({
      name: item.name,
      qty: item.qty,
      price: item.price,
      image: item.image || "",
    })),
    shippingAddress: {
      address: order.shippingAddress.address,
      city: order.shippingAddress.city,
      postalCode: order.shippingAddress.postalCode,
      country: order.shippingAddress.country,
    },
    paymentMethod: order.paymentMethod,
    paymentDetails:
      order.status === "Pending" && order.paymentMethod === "bank_transfer"
        ? order.paymentDetails
        : undefined,
    shippingFee: order.shippingFee,
    createdAt: order.createdAt,
    ...(includeEmail ? { email: order.email || order.guestEmail || "" } : {}),
  };
};

// ─── Create Order ─────────────────────────────────────────────────────────────
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

    if (paymentMethod === "whatsapp") {
      res.status(400).json({
        success: false,
        message:
          "WhatsApp is not a payment method. Please choose Paystack or Bank Transfer.",
      });
      return;
    }

    if (!["paystack", "bank_transfer"].includes(paymentMethod)) {
      res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
      return;
    }

    const isGuest = !req.user;
    const customerEmail = isGuest ? guestEmail : req.user!.email;
    if (!customerEmail) {
      res.status(400).json({ success: false, message: "Email is required" });
      return;
    }

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

    let trackingNumber = generateTrackingNumber();
    let existingOrder = await Order.findOne({ trackingNumber });
    while (existingOrder) {
      trackingNumber = generateTrackingNumber();
      existingOrder = await Order.findOne({ trackingNumber });
    }

    const orderRef = await generateOrderRef();

    const { raw: rawToken, hashed: hashedToken } = generateTrackingToken();

    const sanitizedOrderItems = pricing.orderItems.map((item: any) => ({
      name: item.name || "Unknown Product",
      qty: item.qty || 1,
      price: item.price || 0,
      product: item.product,
      image: item.image || "",
      variant: item.variant,
    }));

    const sanitizedShippingAddress = {
      address: shippingAddress?.address || "No address provided",
      city: shippingAddress?.city || "No city provided",
      postalCode: shippingAddress?.postalCode || "",
      country: shippingAddress?.country || "Nigeria",
      phone: shippingAddress?.phone || "",
      email: shippingAddress?.email || "",
    };

    const settings = await Settings.findOne();

    let paymentDetails;
    if (paymentMethod === "bank_transfer") {
      const defaultAccount =
        settings?.bankAccounts?.find((acc) => acc.isDefault && acc.isActive) ||
        settings?.bankAccounts?.find((acc) => acc.isActive) ||
        null;

      paymentDetails = {
        bankName: defaultAccount?.bankName || process.env.BANK_NAME || "",
        accountName:
          defaultAccount?.accountName || process.env.BANK_ACCOUNT_NAME || "",
        accountNumber:
          defaultAccount?.accountNumber ||
          process.env.BANK_ACCOUNT_NUMBER ||
          "",
      };
    }

    const orderData = {
      user: req.user?._id || null,
      guestEmail: isGuest ? guestEmail : undefined,
      name: req.user?.name || req.body.name || "",
      phone: req.user?.phone || req.body.phone || "",
      email: customerEmail,
      orderRef,
      trackingNumber,
      orderItems: sanitizedOrderItems,
      shippingAddress: sanitizedShippingAddress,
      totalPrice,
      subtotal,
      taxAmount,
      shippingFee,
      status: "Pending" as const,
      paymentMethod,
      paymentDetails,
      couponCode: pricing.couponCode || undefined,
      discount,
      notes: notes || undefined,
      isGift: isGift || false,
      giftMessage: giftMessage || undefined,
      shippingInfo: shippingInfo || {},
      trackingToken: hashedToken,
      trackingTokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };

    const createdOrder = (await Order.create(orderData)) as IOrder;

    const originalSubtotal = createdOrder.orderItems.reduce(
      (sum, item) => sum + item.price * item.qty,
      0,
    );

    sendOrderConfirmation(
      customerEmail,
      createdOrder.orderRef,
      totalPrice,
      req.user?.name || req.body.name || "",
      discount,
      pricing.couponCode,
      originalSubtotal,
      paymentMethod,
      createdOrder.paymentDetails,
      shippingFee,
    ).catch((err) => console.error("Failed to send order confirmation:", err));

    sendAdminOrderNotification(createdOrder, "created").catch((err) =>
      console.error("Failed to send admin order notification:", err),
    );

    const whatsappUrl =
      paymentMethod === "bank_transfer"
        ? buildWhatsAppReceiptUrl(
            createdOrder.orderRef,
            settings?.whatsappNumber || process.env.WHATSAPP_NUMBER,
          )
        : undefined;

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

        createdOrder.paystackReference = paymentData.data.reference;
        await createdOrder.save();

        res.status(201).json({
          success: true,
          order: {
            _id: createdOrder._id,
            orderRef: createdOrder.orderRef,
            status: createdOrder.status,
            totalPrice: createdOrder.totalPrice,
            paymentMethod: createdOrder.paymentMethod,
            trackingNumber: createdOrder.trackingNumber,
            createdAt: createdOrder.createdAt,
          },
          trackingToken: rawToken,
          paymentUrl: paymentData.data.authorization_url,
          reference: paymentData.data.reference,
        });
        return;
      } catch (paystackError) {
        await Order.findByIdAndDelete(createdOrder._id);
        throw paystackError;
      }
    }

    res.status(201).json({
      success: true,
      order: {
        _id: createdOrder._id,
        orderRef: createdOrder.orderRef,
        status: createdOrder.status,
        totalPrice: createdOrder.totalPrice,
        paymentMethod: createdOrder.paymentMethod,
        trackingNumber: createdOrder.trackingNumber,
        createdAt: createdOrder.createdAt,
      },
      trackingToken: rawToken,
      whatsappUrl,
      paymentDetails: createdOrder.paymentDetails,
    });
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
    console.error("Create order error:", error);
    sendError(res, 500, "Internal server error");
  }
};

// ─── Paystack Webhook ─────────────────────────────────────────────────────────
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

    const eventId = event.data?.id;
    if (!eventId) {
      res.status(400).send("Event ID missing");
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

    // ─── Atomic dedup claim ──────────────────────────────────────────────
    // findOneAndUpdate with a filter on paymentEventId === eventId ensures
    // only ONE concurrent webhook request can claim this event. Paystack
    // retries if it doesn't get a fast 200, so a slow first request can
    // otherwise race with a retry and double-deduct stock.
    const claimed = await Order.findOneAndUpdate(
      { _id: order._id, paymentEventId: { $ne: eventId } },
      { $set: { paymentEventId: eventId } },
      { new: true },
    );

    if (!claimed) {
      res.status(200).send("Webhook already processed");
      return;
    }

    if (event.event === "charge.success") {
      if (order.status === "Pending") {
        for (const item of order.orderItems) {
          await decrementStockForItem(
            item.product,
            item.qty,
            item.variant,
          );
        }
      }

      order.status = "Paid";
      order.paymentResult = {
        id: event.data.id,
        status: event.data.status,
        update_time: event.data.paid_at,
      };
      order.paymentEventType = event.event;
      order.paymentConfirmedAt = new Date();
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
      if (customerEmail) {
        sendOrderStatusUpdateEmail(
          customerEmail,
          order.orderRef,
          "Paid",
          order.totalPrice,
          order.name || "",
          order.discount || 0,
          order.couponCode as string,
        ).catch((emailError) => {
          console.error("Failed to send payment status email:", emailError);
        });
      }

      res.status(200).send("Webhook received");
      return;
    }

    if (event.event === "charge.failed") {
      order.paymentEventType = event.event;
      order.paymentFailReason = event.data.gateway_response || "Payment failed";
      await order.save();

      sendAdminOrderNotification(order, "updated", "Failed").catch((err) =>
        console.error("Failed to send admin order notification:", err),
      );

      res.status(200).send("Webhook received");
      return;
    }

    order.paymentEventType = event.event;
    await order.save();
    res.status(200).send("Webhook received");
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).send("Webhook processing failed");
  }
};

// ─── Verify payment — with ownership check ────────────────────────────────
export const verifyPayment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const reference = req.params.reference as string;

    // Ownership check: the reference must belong to an order the requester
    // can see. If the order is attached to a user, that user must be the
    // requester. Guest orders (user: null) can be verified by anyone with
    // the reference, since there's no account to scope against.
    const order = await Order.findOne({ paystackReference: reference }).select(
      "user",
    );

    if (!order) {
      res.status(404).json({ success: false, message: "Payment not found" });
      return;
    }

    if (
      order.user &&
      req.user &&
      order.user.toString() !== req.user._id.toString()
    ) {
      res.status(403).json({ success: false, message: "Not authorized" });
      return;
    }

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

export const trackMyOrder = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const orderId = String(req.params.orderId);
    const order = await Order.findOne({ _id: orderId, user: req.user!._id });

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    if (!["Paid", "Shipped", "Delivered"].includes(order.status)) {
      res.status(404).json({
        success: false,
        message: "Order is not available for tracking yet",
      });
      return;
    }

    res.json({
      success: true,
      order: sanitizeOrderForTracking(order, true),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const trackByToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const token = String(req.params.token);
    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    const order = await Order.findOne({
      trackingToken: hashed,
      trackingTokenExpiresAt: { $gt: new Date() },
    });

    if (!order) {
      res
        .status(404)
        .json({ success: false, message: "Invalid or expired tracking link" });
      return;
    }

    if (!["Paid", "Shipped", "Delivered"].includes(order.status)) {
      res.status(404).json({
        success: false,
        message: "Order is not available for tracking yet",
      });
      return;
    }

    res.json({
      success: true,
      order: sanitizeOrderForTracking(order, false),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const trackOrderManual = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { orderId, email } = req.body;

    if (!orderId || !email) {
      res
        .status(400)
        .json({ success: false, message: "Order ID and email are required" });
      return;
    }

    const cleanOrderId = String(orderId).trim();
    const cleanEmail = String(email).toLowerCase().trim();

    const isValidObjectId = mongoose.Types.ObjectId.isValid(cleanOrderId);
    const identifierCondition = isValidObjectId
      ? {
          $or: [
            { _id: new mongoose.Types.ObjectId(cleanOrderId) },
            { trackingNumber: cleanOrderId },
            { orderRef: cleanOrderId },
          ],
        }
      : {
          $or: [
            { trackingNumber: cleanOrderId },
            { orderRef: cleanOrderId },
          ],
        };

    const order = await Order.findOne({
      $and: [
        identifierCondition,
        { $or: [{ email: cleanEmail }, { guestEmail: cleanEmail }] },
      ],
    }).select("-__v");

    if (!order) {
      res
        .status(404)
        .json({ success: false, message: "Order not found or email mismatch" });
      return;
    }

    if (!["Paid", "Shipped", "Delivered"].includes(order.status)) {
      res.status(404).json({
        success: false,
        message: "Order is not available for tracking yet",
      });
      return;
    }

    res.json({
      success: true,
      order: sanitizeOrderForTracking(order, false),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const trackMyOrderByCode = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { trackingCode } = req.body;

    if (!trackingCode) {
      res
        .status(400)
        .json({ success: false, message: "Tracking code is required" });
      return;
    }

    const code = String(trackingCode).trim();

    const order = await Order.findOne({
      user: req.user!._id,
      $or: [{ trackingNumber: code }, { orderRef: code }],
    });

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    if (!["Paid", "Shipped", "Delivered"].includes(order.status)) {
      res.status(404).json({
        success: false,
        message: "Order is not available for tracking yet",
      });
      return;
    }

    res.json({
      success: true,
      order: sanitizeOrderForTracking(order, true),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};