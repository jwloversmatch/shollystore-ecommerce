import { Request, Response } from "express";
import { Cart } from "../models/Cart";
import { Product } from "../models/Product";
import { AuthRequest } from "../middleware/auth";
import { sendAbandonedCartEmail } from "../services/email.service";

// POST /api/cart
export const saveCart = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { items } = req.body as {
      items: {
        product: string;
        qty: number;
        price: number;
        variant?: { sku?: string; color?: string; size?: string };
      }[];
    };

    if (!items || !Array.isArray(items)) {
      res.status(400).json({ message: "Items array is required" });
      return;
    }

    const validItems = [];
    for (const item of items) {
      if (!item.product || !item.qty || item.qty < 1) continue;
      const product = await Product.findById(item.product);
      if (!product) continue;
      validItems.push({
        product: item.product,
        qty: Math.min(item.qty, product.stock ?? 999),
        price: item.price ?? product.price,
        variant: item.variant || undefined,
      });
    }

    const cart = await Cart.findOneAndUpdate(
      { user: req.user!._id },
      { items: validItems, emailSent: false },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, cart });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ message });
  }
};

// GET /api/cart
export const getCart = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const cart = await Cart.findOne({ user: req.user!._id }).populate(
      "items.product",
      "name slug price images"
    );
    res.json({ success: true, cart: cart || { items: [] } });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ message });
  }
};

// GET /api/cron/abandoned-cart – called by cron job
export const processAbandonedCarts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const secret = req.query.secret as string;
    if (secret !== process.env.ABANDONED_CART_CRON_SECRET) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const cutoff = new Date(Date.now() - 1 * 60 * 1000); // 1 minute ago
    const carts = await Cart.find({
      updatedAt: { $lt: cutoff },
      emailSent: false,
      items: { $ne: [] },
    })
      .populate("user", "email name")
      .populate("items.product", "name price images");

    let sentCount = 0;
    for (const cart of carts) {
      try {
        const user = cart.user as unknown as {
          email?: string;
          name?: string;
        };
        if (!user?.email) continue;

        await sendAbandonedCartEmail(user.email, user.name, cart);
        cart.emailSent = true;
        await cart.save();
        sentCount++;
      } catch (error: unknown) {
        console.error(
          `Failed to send abandoned cart email for cart ${cart._id}:`,
          error
        );
      }
    }

    res.json({
      success: true,
      processed: carts.length,
      emailsSent: sentCount,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ message });
  }
};