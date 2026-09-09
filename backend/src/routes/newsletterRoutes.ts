import express from "express";
import {
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
} from "../controllers/newsletterController";

const router = express.Router();

router.post("/subscribe", subscribeToNewsletter);
router.post("/unsubscribe", unsubscribeFromNewsletter);

export default router;