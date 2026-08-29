import express, { Request, Response } from "express";
import { ContactMessage } from "../models/ContactMessage";
import { sendContactNotification } from "../services/email.service";

const router = express.Router();

// POST /api/contact
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required",
      });
    }

    // 1. Save to database
    const contact = await ContactMessage.create({
      name,
      email,
      subject: subject || "",
      message,
    });

    // 2. Send email notification (non‑blocking, but we await it)
    await sendContactNotification({
      name,
      email,
      subject,
      message,
    });

    return res.status(200).json({
      success: true,
      message: "Message received",
      contactId: contact._id,
    });
  } catch (error: any) {
    console.error("Contact error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;