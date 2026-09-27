import express from "express";
import {
  subscribe,
  unsubscribe,
  sendNotification,
} from "../controllers/pushController";
import { protect } from "../middleware/auth";
import { optionalAuth } from "../middleware/optionalAuth";
import { isAdmin } from "../middleware/isAdmin";

const router = express.Router();

router.post("/subscribe", optionalAuth, subscribe);
router.post("/unsubscribe", optionalAuth, unsubscribe);
router.post("/send", protect, isAdmin, sendNotification);

export default router;