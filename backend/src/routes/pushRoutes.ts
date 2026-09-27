import express from "express";
import {
  subscribe,
  unsubscribe,
  sendNotification,
} from "../controllers/pushController";
import { protect } from "../middleware/auth";
import { isAdmin } from "../middleware/isAdmin";

const router = express.Router();

// Requires an authenticated user — the userId comes from req.user
router.post("/subscribe", protect, subscribe);
router.post("/unsubscribe", protect, unsubscribe);

// Admin-only broadcast
router.post("/send", protect, isAdmin, sendNotification);

export default router;