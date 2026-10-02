import express from "express";
import {
  createOrder,
  paystackWebhook,
  verifyPayment,
  getMyOrders,
  trackMyOrder,
  trackByToken,
  trackOrderManual,
  trackMyOrderByCode,
} from "../controllers/orderController";
import { protect } from "../middleware/auth";
import { optionalAuth } from "../middleware/optionalAuth";
import { validate } from "../middleware/validate";
import {
  checkoutLimiter,
  trackLimiter,
  webhookLimiter,
} from "../middleware/rateLimiter";
import { createOrderSchema } from "../validation/schemas";

const router = express.Router();

// ─── Webhook ──────────────────────────────────────────────────────────────
// Public, uses raw body for signature verification.
// webhookLimiter allows Paystack bursts but caps abuse. Failed requests
// (invalid signatures) count; successful ones don't.
router.post(
  "/webhook",
  webhookLimiter,
  express.raw({ type: "application/json" }),
  paystackWebhook,
);

// ─── Payment verification ─────────────────────────────────────────────────
router.get("/verify/:reference", protect, verifyPayment);

// ─── Create order ─────────────────────────────────────────────────────────
// Public (guest checkout allowed). checkoutLimiter caps per-IP throughput.
router
  .route("/")
  .post(
    checkoutLimiter,
    optionalAuth,
    validate(createOrderSchema),
    createOrder,
  );

// ─── My orders (authenticated) ────────────────────────────────────────────
router.get("/my-orders", protect, getMyOrders);

// ─── Tracking (manual, POST) ──────────────────────────────────────────────
// Guest manual: tracking code + email in body. Public, strictest limiter
// because sequential order refs make brute-force viable.
router.post("/track", trackLimiter, trackOrderManual);

// Logged-in manual: limiter runs first so a spammer hitting us with an
// invalid token doesn't cause a DB lookup via protect.
router.post("/track/me", trackLimiter, protect, trackMyOrderByCode);

// ─── Tracking (token-based, GET) ──────────────────────────────────────────
router.get("/track/:token", trackLimiter, trackByToken);

// ─── Tracking (by order id, authenticated) ────────────────────────────────
// MUST be last so it doesn't shadow /track/:token, /my-orders, etc.
router.get("/:orderId/track", trackLimiter, protect, trackMyOrder);

export default router;