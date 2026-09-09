import { Request, Response } from "express";
import NewsletterSubscriber from "../models/NewsletterSubscriber";
import {
  sendNewsletterWelcomeEmail,
  sendNewsletterUnsubscribeEmail,
} from "../services/email.service";

export const subscribeToNewsletter = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;

  if (!email || typeof email !== "string") {
    res.status(400).json({ success: false, message: "Email is required" });
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const existing = await NewsletterSubscriber.findOne({
      email: normalizedEmail,
    });

    if (existing) {
      if (existing.isActive) {
        res.status(409).json({
          success: false,
          message: "This email is already subscribed",
        });
        return;
      } else {
        existing.isActive = true;
        existing.unsubscribedAt = undefined;
        await existing.save();
        res.status(200).json({
          success: true,
          message: "Subscription reactivated successfully",
        });
        return;
      }
    }

    await NewsletterSubscriber.create({ email: normalizedEmail });

    await sendNewsletterWelcomeEmail(normalizedEmail);

    res.status(201).json({
      success: true,
      message: "Subscription successful",
    });
  } catch (error: any) {
    console.error("Newsletter subscription error:", error);
    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        message: "This email is already subscribed",
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: "Server error, please try again later",
    });
  }
};

export const unsubscribeFromNewsletter = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ success: false, message: "Email is required" });
    return;
  }

  try {
    const subscriber = await NewsletterSubscriber.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!subscriber) {
      res.status(404).json({ success: false, message: "Email not found" });
      return;
    }

    subscriber.isActive = false;
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    try {
      await sendNewsletterUnsubscribeEmail(subscriber.email);
    } catch (emailError) {
      console.error("Failed to send unsubscribe confirmation:", emailError);
    }

    res.json({ success: true, message: "Successfully unsubscribed" });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};