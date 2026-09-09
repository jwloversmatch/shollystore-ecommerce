import express from "express";
import {
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
} from "../controllers/newsletterController";
import { newsletterLimiter } from "../middleware/rateLimiter";

const router = express.Router();

router.post("/subscribe", newsletterLimiter, subscribeToNewsletter);
router.post("/unsubscribe", newsletterLimiter, unsubscribeFromNewsletter);

export default router;